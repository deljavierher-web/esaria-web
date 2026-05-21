
(function(){
'use strict';

/* ── Chat Flow Data ── */
var FLOW = [{"id": "btn-estado", "label": "🚗 ¿Cómo va mi coche?", "userMsg": "Hola, quería saber cómo va la reparación de mi Seat León", "botResponses": ["Déjame consultar el estado... 🔍", "✅ <b>¡Buenas noticias!</b><br><br>Tu Seat León (1234-ABC) ya está <b>listo para recogida</b>.<br><br>📍 Puedes pasar a recogerlo de 8:00 a 19:00.<br>¿Necesitas algo más? 😊"], "backendAction": "car_ready"}, {"id": "btn-presu", "label": "📋 Ver presupuesto", "userMsg": "¿Me podéis enviar el presupuesto del coche?", "botResponses": ["Aquí tienes el presupuesto detallado:", "📋 <b>Presupuesto #2024-089</b><br><br>• Pastillas de freno: 85€<br>• Discos delanteros: 120€<br>• Mano de obra: 60€<br>• <b>Total: 265€</b> (IVA incl.)<br><br>✅ ¿Lo aprobamos para empezar?"], "backendAction": "show_budget"}];
var ACTIONS = {"car_ready": [{"id": "car-1-st", "prop": "textContent", "val": "✅ Listo para Recogida"}, {"id": "car-1-st", "prop": "className", "val": "bp-stext ready"}, {"id": "car-1", "prop": "addclass", "val": "bp-updated"}], "show_budget": [{"id": "budget-panel", "prop": "removeclass", "val": "hidden"}, {"id": "budget-panel", "prop": "addclass", "val": "bp-updated"}]};
var NOMBRE = 'TALLERES MOTORBOX VALLADOLID';

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
