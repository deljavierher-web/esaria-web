
(function(){
'use strict';

/* ── Chat Flow Data ── */
var FLOW = [{"id": "btn-info", "label": "📝 Información de cursos", "userMsg": "Me interesa saber qué cursos tenéis disponibles", "botResponses": ["¡Claro! Estos son nuestros cursos activos:", "📚 <b>Inglés B2</b> — L/X 18:00 (6 plazas)<br>📚 <b>Francés A1</b> — M/J 17:00 (10 plazas)<br>📚 <b>Alemán B1</b> — L/X 19:30 (3 plazas)<br>📚 <b>Refuerzo ESO</b> — M/J 16:00 (8 plazas)<br><br>¿Te interesa alguno? 😊"], "backendAction": null}, {"id": "btn-matricula", "label": "✍️ Matricularme en Inglés B2", "userMsg": "Quiero matricularme en el curso de Inglés B2", "botResponses": ["Perfecto, déjame comprobar plazas... 📋", "✅ <b>¡Matrícula confirmada!</b><br><br>📚 Curso: Inglés B2<br>📅 Lunes y Miércoles 18:00-19:30<br>📍 Aula 3<br>💰 Primera clase de prueba gratis<br><br>¡Te esperamos el próximo lunes! 🎉"], "backendAction": "enroll_course"}];
var ACTIONS = {"enroll_course": [{"id": "curso-b2-st", "prop": "textContent", "val": "5 plazas"}, {"id": "curso-b2", "prop": "addclass", "val": "bp-updated"}]};
var NOMBRE = 'Academia Ángela Fernández';

/* ── State ── */
var busy = false;

/* ── DOM ── */
var chat = null;
var btnsWrap = null;

/* ── Init ── */
function init() {
  // Re-evaluamos el DOM aquí para asegurar que los elementos ya existen en el navegador
  chat = document.getElementById('wa-msgs');
  btnsWrap = document.getElementById('wa-btns');

  try {
    renderButtons();
    addMsg('¡Hola! 👋 Soy el asistente de <b>' + NOMBRE + '</b>. ¿En qué puedo ayudarte?', 'recv');
  } catch (e) {
    console.error('Error in chat init:', e);
  }
  
  try {
    observeFadeUps();
  } catch (e) {
    console.error('Error in fade-up init:', e);
    // Fallback inmediato si observeFadeUps falla
    var els = document.querySelectorAll('.fade-up');
    for (var i = 0; i < els.length; i++) {
      els[i].classList.add('visible');
    }
  }

  try {
    initCalc();
  } catch (e) {
    console.error('Error in calc init:', e);
  }
}

/* ── Buttons ── */
function renderButtons() {
  if (!btnsWrap) return;
  btnsWrap.innerHTML = FLOW.map(function(b, i) {
    return '<button class="wa-btn" data-i="' + i + '">' + b.label + '</button>';
  }).join('');
  
  var buttons = btnsWrap.querySelectorAll('.wa-btn');
  for (var i = 0; i < buttons.length; i++) {
    (function(idx) {
      buttons[idx].addEventListener('click', function() { handleBtn(idx); });
    })(i);
  }
}

/* ── Handle Button Click ── */
function handleBtn(i) {
  if (busy) return;
  busy = true;
  var b = FLOW[i];
  var btn = btnsWrap.querySelector('[data-i="' + i + '"]');
  if (btn) { 
    btn.disabled = true; 
    btn.classList.add('used'); 
  }

  addMsg(b.userMsg, 'sent');
  
  setTimeout(function() {
    showTyping();
    
    var r = 0;
    function nextResponse() {
      if (r < b.botResponses.length) {
        setTimeout(function() {
          hideTyping();
          addMsg(b.botResponses[r], 'recv');
          r++;
          if (r < b.botResponses.length) {
            setTimeout(function() {
              showTyping();
              nextResponse();
            }, 400);
          } else {
            if (b.backendAction) execAction(b.backendAction);
            busy = false;
          }
        }, 1200);
      }
    }
    nextResponse();
  }, 700);
}

/* ── Messages ── */
function addMsg(html, type) {
  if (!chat) return;
  var d = document.createElement('div');
  d.className = 'wa-msg ' + type;
  var now = new Date();
  var hrs = now.getHours();
  var mins = now.getMinutes();
  var t = (hrs < 10 ? '0' + hrs : hrs) + ':' + (mins < 10 ? '0' + mins : mins);
  var tick = type === 'sent' ? ' ✓✓' : '';
  d.innerHTML = '<p>' + html + '</p><span class="wa-t">' + t + tick + '</span>';
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}

function showTyping() {
  if (!chat) return;
  var d = document.createElement('div');
  d.className = 'wa-typing'; 
  d.id = 'typing-ind';
  d.innerHTML = '<span></span><span></span><span></span>';
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}

function hideTyping() {
  var el = document.getElementById('typing-ind');
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

/* ── Backend Actions ── */
function execAction(actionId) {
  var list = ACTIONS[actionId];
  if (!list) return;
  list.forEach(function(a) {
    var el = document.getElementById(a.id);
    if (!el) return;
    if (a.prop === 'addclass') { el.classList.add(a.val); }
    else if (a.prop === 'removeclass') { el.classList.remove(a.val); }
    else { el[a.prop] = a.val; }
  });
}

/* ── Calculator ── */
function initCalc() {
  var s1 = document.getElementById('sl1');
  var s2 = document.getElementById('sl2');
  var s3 = document.getElementById('sl3');
  if (!s1 || !s2 || !s3) return;

  function calc() {
    var m = +s1.value, mins = +s2.value, rate = +s3.value;
    
    var sv1 = document.getElementById('sv1');
    var sv2 = document.getElementById('sv2');
    var sv3 = document.getElementById('sv3');
    if (sv1) sv1.textContent = m;
    if (sv2) sv2.textContent = mins + ' min';
    if (sv3) sv3.textContent = rate + '€';
    
    updSlider(s1); 
    updSlider(s2); 
    updSlider(s3);

    var hours = (m * mins * 22) / 60;
    var money = hours * rate;
    var cancels = Math.round(m * 0.15 * 264);

    animVal('rv-hours', hours.toFixed(1) + 'h');
    animVal('rv-money', Math.round(money).toLocaleString('es-ES') + '€');
    animVal('rv-cancels', cancels.toLocaleString('es-ES'));
  }

  function updSlider(sl) {
    var pct = ((+sl.value - +sl.min) / (+sl.max - +sl.min)) * 100;
    sl.style.setProperty('--p', pct + '%');
  }

  function animVal(id, val) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = val;
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
  }

  var sliders = [s1, s2, s3];
  for (var i = 0; i < sliders.length; i++) {
    sliders[i].addEventListener('input', calc);
    updSlider(sliders[i]);
  }
  calc();
}

/* ── Scroll Animations ── */
function observeFadeUps() {
  var els = document.querySelectorAll('.fade-up');
  
  // Fallback temporal de seguridad: A los 350ms forzamos visibilidad de todo por si falla el scroll/IntersectionObserver
  setTimeout(function() {
    for (var i = 0; i < els.length; i++) {
      els[i].classList.add('visible');
    }
  }, 350);

  if (!('IntersectionObserver' in window)) {
    for (var i = 0; i < els.length; i++) {
      els[i].classList.add('visible');
    }
    return;
  }
  
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { 
        e.target.classList.add('visible'); 
        obs.unobserve(e.target); 
      }
    });
  }, { threshold: 0.15 });
  
  for (var i = 0; i < els.length; i++) {
    obs.observe(els[i]);
  }
}

/* ── Boot ── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else { 
  init(); 
}

})();
