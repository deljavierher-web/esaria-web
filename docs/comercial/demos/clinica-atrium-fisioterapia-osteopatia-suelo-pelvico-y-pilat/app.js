
(function(){
'use strict';

/* ── Chat Flow Data ── */
var FLOW = [{"id": "btn-sesion", "label": "📅 Reservar sesión", "userMsg": "Quería reservar una sesión de fisioterapia para esta semana", "botResponses": ["Déjame comprobar disponibilidad... 📋", "✅ <b>Sesión reservada</b><br><br>📅 Miércoles 17:00<br>💆 Sesión de 45 min<br>📍 Sala 1<br><br>Recuerda traer ropa cómoda. ¡Te esperamos! 😊"], "backendAction": "book_physio"}, {"id": "btn-cambiar", "label": "🔄 Cambiar mi cita", "userMsg": "Necesito cambiar mi cita del viernes a otro día", "botResponses": ["Sin problema, déjame mirar opciones...", "✅ <b>Cita modificada</b><br><br>❌ Viernes 10:00 → cancelada<br>✅ Jueves 18:00 → confirmada<br><br>¿Te viene bien? 😊"], "backendAction": "move_physio"}];
var ACTIONS = {"book_physio": [{"id": "phy-mie-name", "prop": "textContent", "val": "17:00 — Nuevo Paciente"}, {"id": "phy-mie-st", "prop": "textContent", "val": "✅ Reservada"}, {"id": "phy-mie-st", "prop": "className", "val": "bp-slots conf"}, {"id": "phy-mie", "prop": "addclass", "val": "bp-updated"}], "move_physio": [{"id": "phy-vie-name", "prop": "textContent", "val": "10:00 — Cancelada"}, {"id": "phy-vie-st", "prop": "textContent", "val": "❌ Cancelada"}, {"id": "phy-vie-st", "prop": "className", "val": "bp-slots cancel"}, {"id": "phy-jue-name", "prop": "textContent", "val": "18:00 — Laura S."}, {"id": "phy-jue-st", "prop": "textContent", "val": "✅ Confirmada"}, {"id": "phy-jue-st", "prop": "className", "val": "bp-slots conf"}, {"id": "phy-jue", "prop": "addclass", "val": "bp-updated"}, {"id": "phy-vie", "prop": "addclass", "val": "bp-updated"}]};
var NOMBRE = 'Clínica Atrium';

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
