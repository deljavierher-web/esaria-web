/* ============================================================
   EsarIA CRM — app.js (v3 · diseño Claude Design, funcional)
   Vanilla JS sin frameworks, compatible con file://
   Modelo de datos: el del CRM original (nombre_empresa, _uid, ...)
   ============================================================ */

'use strict';

/* ---- Constantes ---- */
var LS_KEY          = 'esaria_leads';
var LS_CAMPAIGN_KEY = 'esaria_campaign_version';
var LS_FILTERS_KEY  = 'esaria_filters';
var LS_VIEW_KEY     = 'esaria_view';
var ESTADOS         = ['Nuevo', 'Investigado', 'Llamado', 'Reunion agendada', 'Descartado'];
var PRIORIDADES     = ['Alta', 'Media', 'Baja'];
var ESTADO_ORDER    = { 'Nuevo': 0, 'Investigado': 1, 'Llamado': 2, 'Reunion agendada': 3, 'Descartado': 4 };
var PRIORIDAD_ORDER = { 'Alta': 0, 'Media': 1, 'Baja': 2 };
var RESULTADOS      = ['Contactado', 'No contesta', 'Ocupado', 'Volver a llamar', 'Reunion agendada', 'No interesado'];

/* ---- Datos demo ---- */
var DEMO_LEADS = [
  {
    id: 'DEMO-001',
    nombre_empresa: 'Clínica Dental Sonríe',
    sector: 'Clinica dental', ciudad: 'Valladolid · Centro',
    telefono: '+34 983 21 44 17', email: 'demo@dentalsonrie.ejemplo', web: 'https://ejemplo.com/dental',
    direccion: 'Calle Mayor, 10, 47001 Valladolid',
    decisor_nombre: 'Dra. Marta Pérez', decisor_cargo: 'Directora / Propietaria',
    fuente_datos: 'DEMO — dato ficticio, no contactar',
    problema_visible: 'Recepción confirma citas a mano por teléfono. Pierden 2-3 h al día y aún así tienen un 18% de no-shows mensuales.',
    oportunidad_automatizacion: 'Recordatorios automáticos por WhatsApp 24h antes con confirmación de un clic. Liberar a recepción y bajar no-shows a un dígito.',
    prioridad: 'Alta', facilidad_contacto: 'Media', tipo_reunion_recomendada: 'Presencial',
    mensaje_llamada_personalizado: 'Hola Marta, soy Javier de EsarIA. Trabajamos con clínicas dentales en Valladolid automatizando los recordatorios de cita por WhatsApp. ¿Te paso un ejemplo de cómo le funciona a otra clínica del centro?',
    mensaje_whatsapp_personalizado: 'Hola Marta, soy Javier de EsarIA (automatización para negocios locales en Valladolid). Ayudamos a clínicas dentales a reducir no-shows con recordatorios automáticos por WhatsApp. ¿Te paso 2 ejemplos en un minuto?',
    estado: 'Reunion agendada',
    notas: 'Decisora directa. Habla rápido y al grano. Mejor llamar entre 14:00 y 15:00.',
    tags: ['demo', 'centro', 'recordatorios'],
    historial: [
      { fecha: '2026-05-14T10:30', resultado: 'Reunion agendada', notas: 'Visita en clínica el martes 19 a las 10:00. Quiere ver demo de recordatorios WhatsApp.' }
    ]
  },
  {
    id: 'DEMO-002',
    nombre_empresa: 'Fisioterapia Pisuerga',
    sector: 'Fisioterapia', ciudad: 'Valladolid · Parquesol',
    telefono: '+34 983 45 22 98', email: 'demo@fisiopisuerga.ejemplo', web: 'https://ejemplo.com/fisio',
    direccion: '', decisor_nombre: 'Carlos Hernández', decisor_cargo: 'Fisioterapeuta / Propietario',
    fuente_datos: 'DEMO — dato ficticio, no contactar',
    problema_visible: 'Apunta las sesiones en agenda de papel. Las cancelaciones de última hora le rompen el cuadrante y no las cobra.',
    oportunidad_automatizacion: 'Sistema de reserva online con política de cancelación de 24h y aviso automático.',
    prioridad: 'Alta', facilidad_contacto: 'Alta', tipo_reunion_recomendada: 'Presencial',
    mensaje_llamada_personalizado: 'Hola Carlos, Javier de EsarIA. He visto que tenéis muy buenas reseñas en Google pero la reserva sigue siendo solo por teléfono. ¿Tienes 2 minutos?',
    mensaje_whatsapp_personalizado: 'Hola Carlos, soy Javier de EsarIA. Te llamé esta mañana sobre el tema de las reservas online y cancelaciones. ¿Cuándo te viene bien una llamada de 10 minutos?',
    estado: 'Llamado',
    notas: 'Mejor por la mañana entre 9 y 10.',
    tags: ['demo', 'parquesol'],
    historial: []
  },
  {
    id: 'DEMO-003',
    nombre_empresa: 'Talleres Hermanos Vega',
    sector: 'Taller mecanico', ciudad: 'Valladolid · Pol. San Cristóbal',
    telefono: '+34 983 33 71 02', email: 'demo@tallereshv.ejemplo', web: '',
    direccion: '', decisor_nombre: 'Javier Vega', decisor_cargo: 'Gerente',
    fuente_datos: 'DEMO — dato ficticio, no contactar',
    problema_visible: 'Avisa por teléfono cuando el coche está listo. Algunos clientes no contestan hasta el día siguiente y se le acumulan vehículos en el patio.',
    oportunidad_automatizacion: 'Aviso automático por SMS/WhatsApp cuando se cierra la orden de trabajo, con link al presupuesto.',
    prioridad: 'Media', facilidad_contacto: 'Media', tipo_reunion_recomendada: 'Presencial',
    mensaje_llamada_personalizado: 'Hola Javier, soy Javier de EsarIA, somos de aquí de Valladolid. ¿Te pasa alguna vez que el coche está listo y el cliente no lo recoge hasta el día siguiente?',
    mensaje_whatsapp_personalizado: '',
    estado: 'Investigado',
    notas: 'Pol. industrial — atiende él directamente entre 13 y 14h.',
    tags: ['demo', 'poligono'],
    historial: []
  },
  {
    id: 'DEMO-004',
    nombre_empresa: 'Pucela Fit',
    sector: 'Gimnasio', ciudad: 'Valladolid · La Rondilla',
    telefono: '+34 983 55 11 24', email: 'demo@pucelafit.ejemplo', web: 'https://ejemplo.com/gym',
    direccion: '', decisor_nombre: 'Laura Castro', decisor_cargo: 'Directora',
    fuente_datos: 'DEMO — dato ficticio, no contactar',
    problema_visible: 'Gestión de socios a mano en Excel. Bajas que tardan en detectarse, cobros que se olvidan, sin recordatorio de renovación.',
    oportunidad_automatizacion: 'Pequeño CRM de socios con cobro recurrente automatizado y avisos antes del vencimiento.',
    prioridad: 'Alta', facilidad_contacto: 'Alta', tipo_reunion_recomendada: 'Presencial',
    mensaje_llamada_personalizado: 'Hola Laura, soy Javier de EsarIA. Trabajamos con gimnasios de Valladolid en automatizar la gestión de socios. ¿Tienes 5 minutos esta semana?',
    mensaje_whatsapp_personalizado: 'Hola Laura, soy Javier de EsarIA. Automatizamos cobros y avisos de renovación para gimnasios locales. ¿Te paso un caso real?',
    estado: 'Nuevo',
    notas: 'Recomendada por la dueña de Aurora Estética. Aún sin contactar.',
    tags: ['demo', 'recomendado'],
    historial: []
  },
  {
    id: 'DEMO-005',
    nombre_empresa: 'Asesoría Castilla & Asociados',
    sector: 'Asesoria', ciudad: 'Valladolid · Centro',
    telefono: '+34 983 19 02 55', email: 'demo@castilla-asesores.ejemplo', web: 'https://ejemplo.com/asesoria',
    direccion: '', decisor_nombre: 'Ramón Castilla', decisor_cargo: 'Socio fundador',
    fuente_datos: 'DEMO — dato ficticio, no contactar',
    problema_visible: 'Recoge documentación de clientes por email. Pierde 4-5 horas semanales pidiendo lo mismo varias veces a los mismos clientes.',
    oportunidad_automatizacion: 'Portal sencillo de subida de documentos con recordatorios automáticos.',
    prioridad: 'Alta', facilidad_contacto: 'Media', tipo_reunion_recomendada: 'Presencial',
    mensaje_llamada_personalizado: 'Buenos días Ramón, le llamo de EsarIA. ¿Tiene un par de minutos para algo relacionado con la recogida de documentación a clientes?',
    mensaje_whatsapp_personalizado: 'Buenas tardes Ramón, soy Javier de EsarIA. Le confirmo la reunión del jueves 21 a las 11:00.',
    estado: 'Reunion agendada',
    notas: 'Trato muy formal — usar usted.',
    tags: ['demo', 'centro', 'decisor-claro'],
    historial: [
      { fecha: '2026-05-15T17:00', resultado: 'Reunion agendada', notas: 'Reunión el jueves 21 a las 11:00 en su despacho.' }
    ]
  }
];

/* ---- Estado global ---- */
var leads = [];
var currentLeadId = null;
var editMode = false;
var selected = new Set();
var currentView = 'cards';
var confirmCallback = null;
var dragUid = null;

/* ---- Helpers ---- */
function $(sel, root) { return (root || document).querySelector(sel); }
function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function esc(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, function(c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function simpleHash(str) {
  var h = 0;
  for (var i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
  return Math.abs(h).toString(36);
}
function newUid(seed) {
  return 'lead-' + simpleHash((seed || '') + '|' + Date.now() + '|' + Math.random());
}
function safeHttpUrl(value) {
  if (!value) return '';
  try {
    var u = new URL(String(value).trim());
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
    return u.href;
  } catch (e) {
    // intentar añadir https:// si parece dominio
    var s = String(value).trim();
    if (/^[\w.-]+\.[a-z]{2,}/i.test(s)) {
      try { return new URL('https://' + s).href; } catch (e2) {}
    }
    return '';
  }
}
function classFromEstado(e) {
  return { 'Nuevo': 'nuevo', 'Investigado': 'investigado', 'Llamado': 'llamado', 'Reunion agendada': 'reunion', 'Descartado': 'descartado' }[e] || 'nuevo';
}
function classFromPrio(p) { return ({ 'Alta': 'alta', 'Media': 'media', 'Baja': 'baja' })[p] || 'media'; }

function ultimaLlamadaTs(lead) {
  var h = lead.historial || [];
  var max = 0;
  for (var i = 0; i < h.length; i++) {
    var t = Date.parse(h[i].fecha || '') || 0;
    if (t > max) max = t;
  }
  return max;
}
function diasDesde(ts) {
  if (!ts) return null;
  return Math.floor((Date.now() - ts) / 86400000);
}
function agoText(dias) {
  if (dias == null) return { txt: 'Sin llamar', cls: '' };
  if (dias <= 0)    return { txt: 'Hoy', cls: 'recent' };
  if (dias === 1)   return { txt: 'Ayer', cls: 'recent' };
  if (dias < 7)     return { txt: 'Hace ' + dias + ' días', cls: '' };
  if (dias < 14)    return { txt: 'Hace ' + dias + ' días', cls: 'warn' };
  return { txt: 'Hace ' + dias + ' días', cls: 'stale' };
}
function nowDateTimeLocal() {
  var d = new Date();
  var pad = function(n) { return String(n).padStart(2, '0'); };
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}
function todayISO() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function fmtFecha(s) {
  if (!s) return '—';
  var d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
}

/* ---- Iconos SVG ---- */
var ICON = {
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  whats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l1.65-3.8A9 9 0 1 1 8.83 21.18L3 21z"/></svg>',
  web:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  eye:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>',
  plus:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  chip:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41 11 22.83 2.17 14a2 2 0 0 1 0-2.83l9.42-9.42a2 2 0 0 1 1.41-.58H21v6.83a2 2 0 0 1-.41 1.41z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
  edit:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'
};

/* ---- LocalStorage ---- */
function getCampaign() {
  if (typeof window !== 'undefined' && window.ESARIA_CAMPAIGN && Array.isArray(window.ESARIA_CAMPAIGN.leads) && window.ESARIA_CAMPAIGN.leads.length > 0) {
    return window.ESARIA_CAMPAIGN;
  }
  return null;
}
function isDemoOrOldLead(l) {
  var tags = Array.isArray(l.tags) ? l.tags : [];
  return String(l.id || '').indexOf('DEMO-') === 0 ||
    String(l.fuente_datos || '').toUpperCase().indexOf('DEMO') !== -1 ||
    String(l.email || '').indexOf('.ejemplo') !== -1 ||
    tags.indexOf('demo') !== -1 ||
    tags.indexOf('llamar-martes') === -1;
}
function campaignLeadsFromSource(campaign) {
  return ensureLeadUids(campaign.leads.map(function(c) {
    return {
      id: c.id || '',
      nombre_empresa: c.nombre_empresa || '',
      sector: c.sector || '',
      ciudad: c.ciudad || '',
      telefono: c.telefono || '',
      email: c.email || '',
      web: c.web || '',
      direccion: c.direccion || '',
      decisor_nombre: c.decisor_nombre || '',
      decisor_cargo: c.decisor_cargo || '',
      fuente_datos: c.fuente_datos || '',
      problema_visible: c.problema_visible || '',
      oportunidad_automatizacion: c.oportunidad_automatizacion || '',
      prioridad: c.prioridad || 'Media',
      facilidad_contacto: c.facilidad_contacto || '',
      tipo_reunion_recomendada: c.tipo_reunion_recomendada || '',
      mensaje_llamada_personalizado: c.mensaje_llamada_personalizado || '',
      mensaje_whatsapp_personalizado: c.mensaje_whatsapp_personalizado || '',
      guion_recepcion_personalizado: c.guion_recepcion_personalizado || '',
      estado: c.estado || 'Nuevo',
      notas: c.notas || '',
      tags: Array.isArray(c.tags) ? c.tags.slice() : [],
      historial: Array.isArray(c.historial) ? c.historial.slice() : [],
      rating: c.rating || '',
      num_resenas: c.num_resenas || '',
      orden_llamada: c.orden_llamada || 0
    };
  }));
}
function loadLeads() {
  var campaign = getCampaign();
  try {
    var raw = localStorage.getItem(LS_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        var savedVersion = localStorage.getItem(LS_CAMPAIGN_KEY) || '';
        var campaignVersion = campaign ? String(campaign.version || '') : '';
        var shouldRestoreCampaign = campaign && savedVersion !== campaignVersion && parsed.some(isDemoOrOldLead);
        if (shouldRestoreCampaign) {
          var restored = campaignLeadsFromSource(campaign);
          localStorage.setItem(LS_KEY, JSON.stringify(restored));
          localStorage.setItem(LS_CAMPAIGN_KEY, campaignVersion);
          return restored;
        }
        return ensureLeadUids(parsed);
      }
    }
  } catch (e) {}
  if (campaign) {
    var campaignLeads = campaignLeadsFromSource(campaign);
    try { localStorage.setItem(LS_CAMPAIGN_KEY, String(campaign.version || '')); } catch (e2) {}
    return campaignLeads;
  }
  return ensureLeadUids(DEMO_LEADS.slice());
}
function saveLeads() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(leads)); } catch (e) {}
}
function ensureLeadUids(list) {
  var seen = {};
  return list.map(function(l, i) {
    if (!l) l = {};
    if (!Array.isArray(l.tags)) l.tags = [];
    if (!Array.isArray(l.historial)) l.historial = [];
    var uid = l._uid;
    if (!uid || seen[uid]) uid = newUid(l.telefono || l.nombre_empresa || i);
    while (seen[uid]) uid = uid + '-' + i;
    l._uid = uid;
    seen[uid] = true;
    return l;
  });
}

function loadView() {
  try {
    var v = localStorage.getItem(LS_VIEW_KEY);
    if (v === 'cards' || v === 'table' || v === 'kanban') currentView = v;
  } catch (e) {}
}
function saveView() { try { localStorage.setItem(LS_VIEW_KEY, currentView); } catch (e) {} }

function loadFiltersFromLS() {
  try {
    var raw = localStorage.getItem(LS_FILTERS_KEY);
    if (!raw) return;
    var f = JSON.parse(raw);
    if (!f) return;
    if (f.q)        $('#search').value = f.q;
    if (f.sector)   setSelectVal('f-sector', f.sector);
    if (f.prio)     setSelectVal('f-prio', f.prio);
    if (f.estado)   setSelectVal('f-estado', f.estado);
    if (f.tag)      setSelectVal('f-tag', f.tag);
    if (f.orden)    setSelectVal('f-orden', f.orden);
  } catch (e) {}
}
function saveFiltersToLS() {
  try {
    localStorage.setItem(LS_FILTERS_KEY, JSON.stringify({
      q: $('#search').value, sector: $('#f-sector').value, prio: $('#f-prio').value,
      estado: $('#f-estado').value, tag: $('#f-tag').value, orden: $('#f-orden').value
    }));
  } catch (e) {}
}
function setSelectVal(id, val) {
  var sel = document.getElementById(id);
  if (!sel) return;
  for (var i = 0; i < sel.options.length; i++) if (sel.options[i].value === val) { sel.value = val; return; }
  var opt = document.createElement('option');
  opt.value = val; opt.textContent = val; sel.appendChild(opt);
  sel.value = val;
}

/* ---- Sectors / Tags dinámicos ---- */
function populateSectorFilter() {
  var sel = $('#f-sector'); var current = sel.value;
  while (sel.options.length > 1) sel.remove(1);
  var arr = [];
  leads.forEach(function(l) { if (l.sector && arr.indexOf(l.sector) === -1) arr.push(l.sector); });
  arr.sort();
  arr.forEach(function(s) { var o = document.createElement('option'); o.value = s; o.textContent = s; sel.appendChild(o); });
  if (current) sel.value = current;
}
function populateTagFilter() {
  var sel = $('#f-tag'); var current = sel.value;
  while (sel.options.length > 1) sel.remove(1);
  var arr = [];
  leads.forEach(function(l) { (l.tags || []).forEach(function(t) { if (t && arr.indexOf(t) === -1) arr.push(t); }); });
  arr.sort();
  arr.forEach(function(t) { var o = document.createElement('option'); o.value = t; o.textContent = t; sel.appendChild(o); });
  if (current) sel.value = current;
}

/* ---- Filtrado con operadores ---- */
function parseQuery(raw) {
  var ops = {}; var freeText = [];
  var tokens = (raw || '').trim().split(/\s+/);
  var re = /^(sector|estado|prioridad|tag|ciudad|decisor):(.+)$/i;
  tokens.forEach(function(t) {
    if (!t) return;
    var m = t.match(re);
    if (m) {
      var k = m[1].toLowerCase(); var v = m[2].replace(/^"|"$/g, '').toLowerCase();
      if (!ops[k]) ops[k] = []; ops[k].push(v);
    } else freeText.push(t.toLowerCase());
  });
  return { ops: ops, free: freeText.join(' ').trim() };
}
function matchesOp(val, candidates) {
  if (!candidates || candidates.length === 0) return true;
  var v = String(val || '').toLowerCase();
  return candidates.some(function(c) { return v.indexOf(c) !== -1; });
}

function visibleLeads() {
  var rawQ = $('#search').value;
  var parsed = parseQuery(rawQ);
  var fSector = $('#f-sector').value;
  var fPrio   = $('#f-prio').value;
  var fEstado = $('#f-estado').value;
  var fTag    = $('#f-tag').value;
  var orden   = $('#f-orden').value;

  var arr = leads.filter(function(l) {
    if (parsed.free) {
      var hay = [l.nombre_empresa, l.sector, l.ciudad, l.decisor_nombre, l.problema_visible,
                 l.email, l.telefono, (l.tags || []).join(' '), l.notas].join(' ').toLowerCase();
      if (hay.indexOf(parsed.free) === -1) return false;
    }
    if (!matchesOp(l.sector, parsed.ops.sector)) return false;
    if (!matchesOp(l.estado, parsed.ops.estado)) return false;
    if (!matchesOp(l.prioridad, parsed.ops.prioridad)) return false;
    if (!matchesOp(l.ciudad, parsed.ops.ciudad)) return false;
    if (!matchesOp(l.decisor_nombre, parsed.ops.decisor)) return false;
    if (parsed.ops.tag) {
      var low = (l.tags || []).map(function(t) { return t.toLowerCase(); });
      if (!parsed.ops.tag.every(function(n) { return low.indexOf(n) !== -1; })) return false;
    }
    if (fSector && l.sector !== fSector) return false;
    if (fPrio   && l.prioridad !== fPrio) return false;
    if (fEstado && l.estado !== fEstado) return false;
    if (fTag    && (l.tags || []).indexOf(fTag) === -1) return false;
    return true;
  });

  arr.sort(function(a, b) {
    if (orden === 'nombre') return (a.nombre_empresa || '').localeCompare(b.nombre_empresa || '');
    if (orden === 'estado') return (ESTADO_ORDER[a.estado] || 9) - (ESTADO_ORDER[b.estado] || 9);
    if (orden === 'prioridad') return (PRIORIDAD_ORDER[a.prioridad] || 9) - (PRIORIDAD_ORDER[b.prioridad] || 9);
    if (orden === 'ultima') return ultimaLlamadaTs(b) - ultimaLlamadaTs(a);
    if (a.orden_llamada && b.orden_llamada && a.orden_llamada !== b.orden_llamada) return a.orden_llamada - b.orden_llamada;
    // smart
    var p = (PRIORIDAD_ORDER[a.prioridad] || 9) - (PRIORIDAD_ORDER[b.prioridad] || 9);
    if (p !== 0) return p;
    var e = (ESTADO_ORDER[a.estado] || 9) - (ESTADO_ORDER[b.estado] || 9);
    if (e !== 0) return e;
    return (a.nombre_empresa || '').localeCompare(b.nombre_empresa || '');
  });

  saveFiltersToLS();
  return arr;
}

/* ---- Stats ---- */
function renderStats() {
  var total = leads.length;
  var alta = leads.filter(function(l) { return l.prioridad === 'Alta'; }).length;
  var reunion = leads.filter(function(l) { return l.estado === 'Reunion agendada'; }).length;
  var hoy = todayISO();
  var llamadosHoy = leads.filter(function(l) {
    return (l.historial || []).some(function(h) { return (h.fecha || '').slice(0, 10) === hoy; });
  }).length;
  $('#stat-total').textContent = total;
  $('#stat-alta').textContent = alta;
  $('#stat-reunion').textContent = reunion;
  $('#stat-hoy').textContent = llamadosHoy;
}

/* ---- Render ---- */
function renderAll() {
  var list = visibleLeads();
  var empty = list.length === 0;
  $('#empty').classList.toggle('show', empty);
  $$('.view').forEach(function(v) {
    v.classList.toggle('active', !empty && v.id === 'view-' + currentView);
  });
  if (!empty) {
    if (currentView === 'cards') renderCards(list);
    else if (currentView === 'table') renderTable(list);
    else renderKanban(list);
  }
  renderHeaderCheckbox(list);
  renderBulkBar();
  renderStats();
}

function tagsHTML(tags, max) {
  var t = (tags || []).slice(0, max || 3);
  return t.map(function(x) { return '<span class="badge tag">' + esc(x) + '</span>'; }).join('');
}

function renderCards(list) {
  $('#cards-grid').innerHTML = list.map(function(L) {
    var dias = diasDesde(ultimaLlamadaTs(L));
    var ago = agoText(dias);
    var sel = selected.has(L._uid) ? ' selected' : '';
    var checked = selected.has(L._uid) ? ' checked' : '';
    var webUrl = safeHttpUrl(L.web);
    return '<article class="card' + sel + '" data-uid="' + esc(L._uid) + '">' +
      '<div class="row-top">' +
        '<div class="check" data-act="check"><div class="checkbox' + checked + '"></div></div>' +
        '<h3>' + esc(L.nombre_empresa) + '</h3>' +
        '<span class="ago ' + ago.cls + '">' + esc(ago.txt) + '</span>' +
      '</div>' +
      '<div class="badges">' +
        '<span class="badge sec no-dot">' + esc(L.sector || '—') + '</span>' +
        '<span class="badge ' + classFromPrio(L.prioridad) + '">' + esc(L.prioridad || 'Media') + '</span>' +
        '<span class="badge ' + classFromEstado(L.estado) + '">' + esc(L.estado || 'Nuevo') + '</span>' +
        tagsHTML(L.tags) +
      '</div>' +
      '<div class="meta-row">' +
        '<span>' + esc(L.ciudad || '—') + '</span>' +
        (L.decisor_nombre ? '<span class="dot"></span><span>' + esc(L.decisor_nombre) + '</span>' : '') +
      '</div>' +
      (L.problema_visible ? '<p class="problem">' + esc(L.problema_visible) + '</p>' : '') +
      '<div class="actions">' +
        '<button class="btn-action" data-act="view">' + ICON.eye + '<span>Ver</span></button>' +
        '<button class="btn-action" data-act="call">' + ICON.phone + '<span>Llamar</span></button>' +
        '<button class="btn-action" data-act="copy-tel">' + ICON.copy + '<span>Tel.</span></button>' +
        '<button class="btn-action" data-act="whatsapp">' + ICON.whats + '<span>WA</span></button>' +
        (webUrl ? '<button class="btn-action" data-act="web">' + ICON.web + '<span>Web</span></button>' : '') +
      '</div>' +
    '</article>';
  }).join('');
}

function renderTable(list) {
  $('#table-body').innerHTML = list.map(function(L) {
    var dias = diasDesde(ultimaLlamadaTs(L));
    var ago = agoText(dias);
    var checked = selected.has(L._uid) ? ' checked' : '';
    var sel = selected.has(L._uid) ? ' selected' : '';
    var agoBg = ago.cls === 'stale' ? 'var(--red-bg)' : ago.cls === 'warn' ? 'var(--amb-bg)' : 'var(--gry-bg)';
    var agoFg = ago.cls === 'stale' ? 'var(--red-fg)' : ago.cls === 'warn' ? 'var(--amb-fg)' : 'var(--subtle)';
    var webUrl = safeHttpUrl(L.web);
    return '<tr class="' + sel + '" data-uid="' + esc(L._uid) + '">' +
      '<td class="col-check" data-act="check"><div class="checkbox' + checked + '"></div></td>' +
      '<td class="company">' + esc(L.nombre_empresa) + '</td>' +
      '<td><span class="badge sec no-dot">' + esc(L.sector || '—') + '</span></td>' +
      '<td class="secondary">' + esc(L.ciudad || '—') + '</td>' +
      '<td>' + esc(L.decisor_nombre || '—') + '</td>' +
      '<td><span class="badge ' + classFromPrio(L.prioridad) + '">' + esc(L.prioridad || 'Media') + '</span></td>' +
      '<td><span class="badge ' + classFromEstado(L.estado) + '">' + esc(L.estado || 'Nuevo') + '</span></td>' +
      '<td class="mono secondary">' + esc(L.telefono || '—') + '</td>' +
      '<td class="secondary"><span class="badge no-dot" style="background:' + agoBg + ';color:' + agoFg + '">' + esc(ago.txt) + '</span></td>' +
      '<td class="col-actions">' +
        '<div class="row-actions">' +
          '<button data-act="view" title="Ver">' + ICON.eye + '</button>' +
          '<button data-act="call" title="Registrar llamada">' + ICON.phone + '</button>' +
          '<button data-act="whatsapp" title="WhatsApp">' + ICON.whats + '</button>' +
          (webUrl ? '<button data-act="web" title="Web">' + ICON.web + '</button>' : '') +
        '</div>' +
      '</td>' +
    '</tr>';
  }).join('');
}

function renderKanban(list) {
  $('#kanban-grid').innerHTML = ESTADOS.map(function(estado) {
    var items = list.filter(function(l) { return l.estado === estado; });
    var body = items.length === 0
      ? '<div class="kcol-empty">Sin leads</div>'
      : items.map(function(L) {
          var dias = diasDesde(ultimaLlamadaTs(L));
          var ago = agoText(dias);
          var firstDecisor = (L.decisor_nombre || '').split(' ')[0] || '—';
          return '<div class="kcard" draggable="true" data-uid="' + esc(L._uid) + '">' +
            '<h5 class="ktitle">' + esc(L.nombre_empresa) + '</h5>' +
            '<div class="kmeta">' +
              '<span class="badge sec no-dot">' + esc(L.sector || '—') + '</span>' +
              '<span class="badge ' + classFromPrio(L.prioridad) + '">' + esc(L.prioridad || 'Media') + '</span>' +
            '</div>' +
            '<div class="kfooter">' +
              '<span class="badge tag" style="font-size:10.5px">' + esc(firstDecisor) + '</span>' +
              '<span class="ago">' + esc(ago.txt) + '</span>' +
            '</div>' +
          '</div>';
        }).join('');
    return '<div class="kcol" data-state="' + esc(estado) + '">' +
      '<div class="khead">' +
        '<span class="swatch"></span>' +
        '<h4>' + esc(estado) + '</h4>' +
        '<span class="ct">' + items.length + '</span>' +
        '<button class="add" title="Nuevo lead en ' + esc(estado) + '" data-act="add-here" data-state="' + esc(estado) + '">' + ICON.plus + '</button>' +
      '</div>' +
      '<div class="klist">' + body + '</div>' +
    '</div>';
  }).join('');
}

function renderHeaderCheckbox(list) {
  var cb = $('#th-check'); if (!cb) return;
  var vis = list || visibleLeads();
  var selVis = vis.filter(function(L) { return selected.has(L._uid); }).length;
  cb.classList.remove('checked', 'indeterminate');
  if (selVis === 0) {}
  else if (selVis === vis.length) cb.classList.add('checked');
  else cb.classList.add('indeterminate');
}

function renderBulkBar() {
  var n = selected.size;
  $('#bulk-bar').classList.toggle('show', n > 0);
  $('#bulk-count').textContent = n;
}

function updateViewToggle() {
  $$('.view-toggle button').forEach(function(b) {
    b.classList.toggle('active', b.dataset.view === currentView);
  });
}

/* ---- Selección ---- */
function toggleSelected(uid) {
  if (selected.has(uid)) selected.delete(uid);
  else selected.add(uid);
  renderAll();
}
function clearSelection() { selected.clear(); renderAll(); }
function toggleAllVisible() {
  var vis = visibleLeads();
  var allOn = vis.every(function(L) { return selected.has(L._uid); });
  if (allOn) vis.forEach(function(L) { selected.delete(L._uid); });
  else vis.forEach(function(L) { selected.add(L._uid); });
  renderAll();
}

/* ---- Acciones por fila/tarjeta ---- */
function handleAction(uid, act) {
  var L = leads.find(function(x) { return x._uid === uid; });
  if (!L) return;
  if (act === 'check') return toggleSelected(uid);
  if (act === 'view') return openView(uid);
  if (act === 'call') return openView(uid, true);
  if (act === 'copy-tel') return copyText(L.telefono, 'Teléfono copiado');
  if (act === 'whatsapp') return openWhats(L);
  if (act === 'web') {
    var u = safeHttpUrl(L.web);
    if (u) window.open(u, '_blank', 'noopener');
    return;
  }
}

/* ---- Clipboard / WhatsApp ---- */
function copyText(text, msg) {
  if (!text) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() { toast(msg || 'Copiado'); }).catch(function() { fallbackCopy(text, msg); });
  } else fallbackCopy(text, msg);
}
function fallbackCopy(text, msg) {
  var ta = document.createElement('textarea'); ta.value = text;
  ta.style.position = 'fixed'; ta.style.left = '-9999px';
  document.body.appendChild(ta); ta.focus(); ta.select();
  try { document.execCommand('copy'); toast(msg || 'Copiado'); } catch (e) {}
  document.body.removeChild(ta);
}
function openWhats(L) {
  var num = (L.telefono || '').replace(/\s/g, '').replace(/[^\d+]/g, '');
  var url = 'https://wa.me/' + encodeURIComponent(num) + '?text=' + encodeURIComponent(L.mensaje_whatsapp_personalizado || '');
  window.open(url, '_blank', 'noopener');
}

/* ---- Toast ---- */
var toastTimer = null;
function toast(msg) {
  $('#toast-msg').textContent = msg;
  $('#toast').classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function() { $('#toast').classList.remove('show'); }, 2500);
}

/* ---- Modal: ver lead ---- */
function openView(uid, focusCall) {
  var L = leads.find(function(x) { return x._uid === uid; });
  if (!L) return;
  currentLeadId = uid;
  editMode = false;
  $('#view-body').innerHTML = buildViewBody(L);
  bindViewBodyEvents(L);
  openModal('modal-view');
  if (focusCall) setTimeout(function() {
    var el = $('#nc-notes'); if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }, 100);
}

function buildViewBody(L) {
  var webUrl = safeHttpUrl(L.web);
  var igUrl  = L.instagram ? 'https://instagram.com/' + encodeURIComponent(String(L.instagram).replace('@', '')) : '';
  var liUrl  = safeHttpUrl(L.linkedin);

  var resultadosOpts = RESULTADOS.map(function(r) { return '<option>' + esc(r) + '</option>'; }).join('');

  return '<div class="lead-head">' +
    '<div class="info">' +
      '<h2>' + esc(L.nombre_empresa) + '</h2>' +
      '<div class="sub">' +
        '<span>' + esc(L.ciudad || '—') + '</span>' +
        (L.decisor_nombre ? '<span style="color:var(--border-strong)">·</span><span>' + esc(L.decisor_nombre) + (L.decisor_cargo ? ' · ' + esc(L.decisor_cargo) : '') + '</span>' : '') +
      '</div>' +
      '<div class="badges">' +
        '<span class="badge sec no-dot">' + esc(L.sector || '—') + '</span>' +
        '<span class="badge ' + classFromPrio(L.prioridad) + '">' + esc(L.prioridad || 'Media') + '</span>' +
        '<span class="badge ' + classFromEstado(L.estado) + '">' + esc(L.estado || 'Nuevo') + '</span>' +
      '</div>' +
    '</div>' +
  '</div>' +

  '<div class="section">' +
    '<div class="section-label">' + ICON.chip + ' Tags</div>' +
    '<div id="tags-wrapper">' + buildTagsHTML(L.tags || []) + '</div>' +
  '</div>' +

  '<div class="section">' +
    '<div class="section-label">Empresa</div>' +
    '<div class="kv-grid">' +
      kv('Sector', L.sector) +
      kv('Ciudad', L.ciudad) +
      kv('Decisor', L.decisor_nombre) +
      kv('Cargo', L.decisor_cargo) +
      (L.direccion ? kvFull('Dirección', L.direccion) : '') +
      (webUrl ? kvHTML('Web', '<a href="' + esc(webUrl) + '" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:none;font-weight:500">' + esc(webUrl) + '</a>') : '') +
      (igUrl ? kvHTML('Instagram', '<a href="' + esc(igUrl) + '" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:none;font-weight:500">' + esc(L.instagram) + '</a>') : '') +
      (liUrl ? kvHTML('LinkedIn', '<a href="' + esc(liUrl) + '" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:none;font-weight:500">LinkedIn</a>') : '') +
    '</div>' +
  '</div>' +

  '<div class="section">' +
    '<div class="section-label">Análisis</div>' +
    (L.problema_visible ? '<div class="text-box" style="margin-bottom:8px"><strong style="display:block;font-size:11px;text-transform:uppercase;color:var(--subtle);letter-spacing:.5px;margin-bottom:4px">Problema visible</strong>' + esc(L.problema_visible) + '</div>' : '') +
    (L.oportunidad_automatizacion ? '<div class="text-box opp"><strong style="display:block;font-size:11px;text-transform:uppercase;color:var(--accent);letter-spacing:.5px;margin-bottom:4px">Oportunidad de automatización</strong>' + esc(L.oportunidad_automatizacion) + '</div>' : '') +
  '</div>' +

  '<div class="section">' +
    '<div class="section-label">Contacto</div>' +
    '<div class="kv-grid">' +
      '<div class="kv"><div class="k">Teléfono</div><div class="v"><span class="mono">' + esc(L.telefono || '—') + '</span>' +
        (L.telefono ? '<button class="copy" data-copy-tel>' + ICON.copy + '</button>' : '') + '</div></div>' +
      '<div class="kv"><div class="k">Email</div><div class="v"><span class="mono" style="font-size:12.5px">' + esc(L.email || '—') + '</span>' +
        (L.email ? '<button class="copy" data-copy-email>' + ICON.copy + '</button>' : '') + '</div></div>' +
      (L.fuente_datos ? kvFull('Fuente datos', L.fuente_datos) : '') +
    '</div>' +
  '</div>' +

  (L.mensaje_llamada_personalizado ?
  '<div class="section">' +
    '<div class="section-label">Guion de llamada</div>' +
    '<div class="text-box script">' + esc(L.mensaje_llamada_personalizado) + '</div>' +
    '<div style="margin-top:10px"><button class="btn btn-secondary" data-copy-call>' + ICON.copy + ' Copiar guion</button></div>' +
  '</div>' : '') +

  '<div class="section">' +
    '<div class="section-label">Mensaje WhatsApp</div>' +
    (L.mensaje_whatsapp_personalizado
      ? '<div class="text-box">' + esc(L.mensaje_whatsapp_personalizado) + '</div>' +
        '<div style="margin-top:10px;display:flex;gap:8px">' +
          '<button class="btn btn-secondary" data-copy-wa>' + ICON.copy + ' Copiar</button>' +
          '<button class="btn btn-primary" data-open-wa>' + ICON.whats + ' Abrir WhatsApp</button>' +
        '</div>'
      : '<div class="text-box" style="color:var(--muted);font-style:italic">Sin mensaje preparado. Edita el lead para añadir uno.</div>') +
  '</div>' +

  '<div class="section">' +
    '<div class="section-label">Historial de llamadas <span style="margin-left:auto;font-weight:500;color:var(--muted);text-transform:none;letter-spacing:0">' +
      (L.historial || []).length + ' ' + ((L.historial || []).length === 1 ? 'entrada' : 'entradas') + '</span></div>' +
    '<div class="history" id="historial-list">' + buildHistorialHTML(L.historial) + '</div>' +
    '<div class="new-call">' +
      '<input type="datetime-local" id="nc-date" value="' + nowDateTimeLocal() + '" />' +
      '<select id="nc-result">' + resultadosOpts + '</select>' +
      '<textarea id="nc-notes" placeholder="Notas de la llamada — qué se dijo, próxima acción..."></textarea>' +
      '<div class="actions"><button class="btn btn-secondary" id="btn-add-call">' + ICON.plus + ' Añadir entrada</button></div>' +
    '</div>' +
  '</div>' +

  '<div class="section">' +
    '<div class="section-label">Estado y notas</div>' +
    '<div class="form-grid">' +
      '<div class="field"><label>Estado</label><select id="view-estado">' +
        ESTADOS.map(function(s) { return '<option ' + (s === L.estado ? 'selected' : '') + '>' + esc(s) + '</option>'; }).join('') +
      '</select></div>' +
      '<div class="field"><label>Prioridad</label><select id="view-prio">' +
        PRIORIDADES.map(function(s) { return '<option ' + (s === L.prioridad ? 'selected' : '') + '>' + esc(s) + '</option>'; }).join('') +
      '</select></div>' +
      '<div class="field full"><label>Notas internas</label><textarea id="view-notas" rows="3">' + esc(L.notas || '') + '</textarea></div>' +
    '</div>' +
  '</div>';
}

function kv(label, value) { return '<div class="kv"><div class="k">' + esc(label) + '</div><div class="v">' + esc(value || '—') + '</div></div>'; }
function kvFull(label, value) { return '<div class="kv" style="grid-column:1/-1"><div class="k">' + esc(label) + '</div><div class="v">' + esc(value || '—') + '</div></div>'; }
function kvHTML(label, html) { return '<div class="kv"><div class="k">' + esc(label) + '</div><div class="v">' + html + '</div></div>'; }

function buildTagsHTML(tags) {
  var chips = tags.map(function(t, i) {
    return '<span class="chip">' + esc(t) +
      '<button data-tag-del="' + i + '" aria-label="Quitar ' + esc(t) + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
      '</button></span>';
  }).join('');
  return '<div class="chip-row">' + chips + '<input class="chip-input" id="tag-new" placeholder="+ añadir tag y Enter"></div>';
}

function buildHistorialHTML(historial) {
  if (!historial || historial.length === 0) {
    return '<div class="text-box" style="color:var(--muted);font-style:italic;text-align:center;padding:18px">Sin llamadas registradas todavía.</div>';
  }
  // Orden descendente por fecha
  var sorted = historial.slice().sort(function(a, b) {
    return (Date.parse(b.fecha || '') || 0) - (Date.parse(a.fecha || '') || 0);
  });
  return sorted.map(function(h) {
    var origIdx = historial.indexOf(h);
    var r = (h.resultado || '').toLowerCase();
    var cls = 'llamado';
    if (r.indexOf('reuni') !== -1) cls = 'reunion';
    else if (r.indexOf('no interes') !== -1 || r.indexOf('descart') !== -1) cls = 'descartado';
    else if (r.indexOf('contacta') !== -1) cls = 'nuevo';
    return '<div class="history-item">' +
      '<div class="row1">' +
        '<span class="date">' + esc(fmtFecha(h.fecha)) + '</span>' +
        '<span class="badge ' + cls + ' no-dot">' + esc(h.resultado || '—') + '</span>' +
        '<button class="delete" data-hist-del="' + origIdx + '" aria-label="Eliminar entrada">' + ICON.trash + '</button>' +
      '</div>' +
      (h.notas ? '<div class="notes">' + esc(h.notas) + '</div>' : '') +
    '</div>';
  }).join('');
}

function bindViewBodyEvents(L) {
  var body = $('#view-body');

  // Tags
  $$('[data-tag-del]', body).forEach(function(btn) {
    btn.addEventListener('click', function() {
      var i = parseInt(btn.getAttribute('data-tag-del'), 10);
      L.tags.splice(i, 1);
      saveLeads();
      $('#tags-wrapper').innerHTML = buildTagsHTML(L.tags);
      bindViewBodyEvents(L);
      populateTagFilter();
      renderAll();
    });
  });
  var tagInput = $('#tag-new', body);
  if (tagInput) {
    tagInput.addEventListener('keydown', function(e) {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      var v = this.value.trim(); if (!v) return;
      if (!Array.isArray(L.tags)) L.tags = [];
      if (L.tags.indexOf(v) === -1) L.tags.push(v);
      this.value = '';
      saveLeads();
      $('#tags-wrapper').innerHTML = buildTagsHTML(L.tags);
      bindViewBodyEvents(L);
      populateTagFilter();
      renderAll();
    });
  }

  // Copy buttons
  var btnCT = $('[data-copy-tel]', body); if (btnCT) btnCT.addEventListener('click', function() { copyText(L.telefono, 'Teléfono copiado'); });
  var btnCE = $('[data-copy-email]', body); if (btnCE) btnCE.addEventListener('click', function() { copyText(L.email, 'Email copiado'); });
  var btnCC = $('[data-copy-call]', body); if (btnCC) btnCC.addEventListener('click', function() { copyText(L.mensaje_llamada_personalizado, 'Guion copiado'); });
  var btnCW = $('[data-copy-wa]', body);   if (btnCW) btnCW.addEventListener('click', function() { copyText(L.mensaje_whatsapp_personalizado, 'Mensaje copiado'); });
  var btnOW = $('[data-open-wa]', body);   if (btnOW) btnOW.addEventListener('click', function() { openWhats(L); });

  // Estado/Prioridad/Notas
  $('#view-estado', body).addEventListener('change', function() { L.estado = this.value; saveLeads(); renderStats(); renderAll(); });
  $('#view-prio', body).addEventListener('change', function() { L.prioridad = this.value; saveLeads(); renderStats(); renderAll(); });
  $('#view-notas', body).addEventListener('blur', function() { L.notas = this.value; saveLeads(); });

  // Historial: añadir
  $('#btn-add-call', body).addEventListener('click', function() {
    var fecha = $('#nc-date').value || nowDateTimeLocal();
    var resultado = $('#nc-result').value;
    var notas = $('#nc-notes').value.trim();
    if (!notas) { toast('Añade notas antes de guardar'); return; }
    if (!Array.isArray(L.historial)) L.historial = [];
    L.historial.unshift({ fecha: fecha, resultado: resultado, notas: notas });
    // Auto-actualizar estado
    if (resultado === 'Reunion agendada') L.estado = 'Reunion agendada';
    else if (resultado === 'No interesado') L.estado = 'Descartado';
    else if (L.estado === 'Nuevo' || L.estado === 'Investigado') L.estado = 'Llamado';
    saveLeads();
    $('#view-body').innerHTML = buildViewBody(L);
    bindViewBodyEvents(L);
    renderAll();
    toast('Llamada registrada');
  });

  // Historial: eliminar
  $$('[data-hist-del]', body).forEach(function(btn) {
    btn.addEventListener('click', function() {
      var i = parseInt(btn.getAttribute('data-hist-del'), 10);
      L.historial.splice(i, 1);
      saveLeads();
      $('#view-body').innerHTML = buildViewBody(L);
      bindViewBodyEvents(L);
      renderAll();
    });
  });
}

/* ---- Modal: editar lead ---- */
function openEditCurrent() {
  if (currentLeadId == null) return;
  closeModal('modal-view');
  setTimeout(function() { openEdit(currentLeadId, false); }, 80);
}

function openEdit(uid, isNew) {
  var L = isNew ? newLeadTemplate() : leads.find(function(x) { return x._uid === uid; });
  if (!L) return;
  currentLeadId = L._uid;
  editMode = true;
  $('#edit-title').textContent = isNew ? 'Nuevo lead' : 'Editar lead';
  $('#edit-body').innerHTML = buildEditBody(L);
  $('#edit-body').dataset.isNew = isNew ? '1' : '0';
  openModal('modal-edit');
}

function newLeadTemplate() {
  return {
    _uid: newUid('new'), _isNew: true,
    nombre_empresa: '', sector: '', ciudad: 'Valladolid',
    telefono: '', email: '', web: '', instagram: '', linkedin: '',
    direccion: '', decisor_nombre: '', decisor_cargo: '',
    fuente_datos: '', problema_visible: '', oportunidad_automatizacion: '',
    prioridad: 'Media', facilidad_contacto: '', tipo_reunion_recomendada: '',
    mensaje_llamada_personalizado: '', mensaje_whatsapp_personalizado: '',
    estado: 'Nuevo', notas: '', tags: [], historial: []
  };
}

function buildEditBody(L) {
  var selOpts = function(opts, val) {
    return opts.map(function(o) { return '<option ' + (o === val ? 'selected' : '') + '>' + esc(o) + '</option>'; }).join('');
  };
  return '<div class="form-grid">' +
    '<div class="field full"><label>Empresa *</label><input data-field="nombre_empresa" value="' + esc(L.nombre_empresa) + '" placeholder="Nombre comercial" /></div>' +
    '<div class="field"><label>Sector</label><input data-field="sector" value="' + esc(L.sector) + '" placeholder="Clinica dental, Taller, ..." /></div>' +
    '<div class="field"><label>Ciudad / Zona</label><input data-field="ciudad" value="' + esc(L.ciudad) + '" /></div>' +
    '<div class="field"><label>Decisor</label><input data-field="decisor_nombre" value="' + esc(L.decisor_nombre) + '" placeholder="Nombre y apellidos" /></div>' +
    '<div class="field"><label>Cargo</label><input data-field="decisor_cargo" value="' + esc(L.decisor_cargo) + '" /></div>' +
    '<div class="field"><label>Teléfono</label><input data-field="telefono" value="' + esc(L.telefono) + '" placeholder="+34 ..." /></div>' +
    '<div class="field"><label>Email</label><input data-field="email" type="email" value="' + esc(L.email) + '" /></div>' +
    '<div class="field"><label>Web</label><input data-field="web" value="' + esc(L.web) + '" placeholder="empresa.es" /></div>' +
    '<div class="field"><label>Instagram</label><input data-field="instagram" value="' + esc(L.instagram || '') + '" placeholder="@empresa" /></div>' +
    '<div class="field"><label>Prioridad</label><select data-field="prioridad">' + selOpts(PRIORIDADES, L.prioridad || 'Media') + '</select></div>' +
    '<div class="field"><label>Estado</label><select data-field="estado">' + selOpts(ESTADOS, L.estado || 'Nuevo') + '</select></div>' +
    '<div class="field full"><label>Dirección</label><input data-field="direccion" value="' + esc(L.direccion || '') + '" /></div>' +
    '<div class="field full"><label>Tags (separados por coma)</label><input data-field="_tags_csv" value="' + esc((L.tags || []).join(', ')) + '" placeholder="centro, recordatorios, vip" /></div>' +
    '<div class="field full"><label>Problema visible</label><textarea data-field="problema_visible" rows="2">' + esc(L.problema_visible || '') + '</textarea></div>' +
    '<div class="field full"><label>Oportunidad de automatización</label><textarea data-field="oportunidad_automatizacion" rows="2">' + esc(L.oportunidad_automatizacion || '') + '</textarea></div>' +
    '<div class="field full"><label>Guion de llamada</label><textarea data-field="mensaje_llamada_personalizado" rows="3">' + esc(L.mensaje_llamada_personalizado || '') + '</textarea></div>' +
    '<div class="field full"><label>Mensaje WhatsApp</label><textarea data-field="mensaje_whatsapp_personalizado" rows="3">' + esc(L.mensaje_whatsapp_personalizado || '') + '</textarea></div>' +
    '<div class="field full"><label>Notas internas</label><textarea data-field="notas" rows="2">' + esc(L.notas || '') + '</textarea></div>' +
  '</div>';
}

function saveEdit() {
  var body = $('#edit-body');
  var isNew = body.dataset.isNew === '1';
  var L = leads.find(function(x) { return x._uid === currentLeadId; }) || (isNew ? newLeadTemplate() : null);
  if (!L) return;
  // Si es nuevo, garantizar uid
  if (isNew && !L._uid) L._uid = newUid('new');

  $$('[data-field]', body).forEach(function(el) {
    var key = el.getAttribute('data-field');
    var val = el.value;
    if (key === '_tags_csv') {
      L.tags = val.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
    } else {
      L[key] = val;
    }
  });

  if (!L.nombre_empresa || !L.nombre_empresa.trim()) {
    toast('Falta el nombre de empresa');
    return;
  }

  if (isNew) {
    delete L._isNew;
    leads.unshift(L);
  }
  saveLeads();
  populateSectorFilter();
  populateTagFilter();
  closeModal('modal-edit');
  renderAll();
  toast(isNew ? 'Lead creado' : 'Cambios guardados');
}

/* ---- Eliminar ---- */
function deleteLead(uid) {
  var idx = leads.findIndex(function(l) { return l._uid === uid; });
  if (idx === -1) return;
  leads.splice(idx, 1);
  selected.delete(uid);
  saveLeads();
  populateSectorFilter();
  populateTagFilter();
  renderAll();
}

/* ---- Bulk ---- */
function bulkSetField(field, value) {
  var n = 0;
  leads.forEach(function(l) { if (selected.has(l._uid)) { l[field] = value; n++; } });
  if (n > 0) { saveLeads(); renderAll(); toast(n + ' leads actualizados'); }
}
function bulkAddTag() {
  if (selected.size === 0) return;
  var tag = prompt('Tag a añadir a ' + selected.size + ' leads:');
  if (!tag) return;
  tag = tag.trim(); if (!tag) return;
  var n = 0;
  leads.forEach(function(l) {
    if (!selected.has(l._uid)) return;
    if (!Array.isArray(l.tags)) l.tags = [];
    if (l.tags.indexOf(tag) === -1) { l.tags.push(tag); n++; }
  });
  if (n > 0) { saveLeads(); populateTagFilter(); renderAll(); toast('Tag "' + tag + '" añadido a ' + n + ' leads'); }
}
function bulkDelete() {
  if (selected.size === 0) return;
  openConfirm('¿Eliminar ' + selected.size + ' leads seleccionados?', 'Esta acción no se puede deshacer.', function() {
    var n = selected.size;
    leads = leads.filter(function(l) { return !selected.has(l._uid); });
    selected.clear();
    saveLeads();
    populateSectorFilter();
    populateTagFilter();
    renderAll();
    toast(n + ' leads eliminados');
  });
}

/* ---- Confirm modal ---- */
function openConfirm(title, text, cb) {
  $('#confirm-title').textContent = title;
  $('#confirm-text').textContent = text || '';
  confirmCallback = cb;
  openModal('modal-confirm');
}

/* ---- Importar / Exportar ---- */
function exportJSON() {
  var clean = leads.map(function(l) { var c = Object.assign({}, l); delete c._isNew; return c; });
  var blob = new Blob([JSON.stringify(clean, null, 2)], { type: 'application/json' });
  triggerDownload(blob, 'esaria-leads.json');
  toast('JSON exportado');
}
function exportCSV() {
  if (leads.length === 0) { toast('No hay leads'); return; }
  var cols = ['nombre_empresa', 'sector', 'ciudad', 'telefono', 'email', 'web', 'direccion',
    'decisor_nombre', 'decisor_cargo', 'prioridad', 'estado',
    'problema_visible', 'oportunidad_automatizacion',
    'tags', 'ultima_llamada', 'num_llamadas', 'notas'];
  var header = cols.join(';');
  var rows = leads.map(function(l) {
    var ultTs = ultimaLlamadaTs(l);
    return cols.map(function(c) {
      var v;
      if (c === 'tags') v = (l.tags || []).join(',');
      else if (c === 'ultima_llamada') v = ultTs ? new Date(ultTs).toISOString() : '';
      else if (c === 'num_llamadas') v = (l.historial || []).length;
      else v = l[c] != null ? l[c] : '';
      return csvCell(v);
    }).join(';');
  });
  var bom = '﻿';
  var blob = new Blob([bom + header + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, 'esaria-leads.csv');
  toast('CSV exportado');
}
function csvCell(v) {
  var s = String(v == null ? '' : v).replace(/\r?\n/g, ' ');
  if (s.indexOf(';') !== -1 || s.indexOf('"') !== -1) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
}
function triggerDownload(blob, filename) {
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function importJSON(file) {
  var r = new FileReader();
  r.onload = function(e) {
    try {
      var data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error('No es un array de leads.');
      leads = ensureLeadUids(data);
      saveLeads();
      populateSectorFilter(); populateTagFilter();
      renderAll();
      toast(data.length + ' leads importados');
    } catch (err) {
      alert('Error al importar: ' + err.message);
    }
  };
  r.readAsText(file);
}

/* ---- Modal helpers ---- */
function openModal(id) { $('#' + id).classList.add('show'); document.body.style.overflow = 'hidden'; }
function closeModal(id) {
  $('#' + id).classList.remove('show');
  if ($$('.modal-overlay.show').length === 0) document.body.style.overflow = '';
}

/* ---- Drag & drop kanban ---- */
function bindKanbanDnD() {
  // delegación: las cards y cols se crean dinámicamente
  var grid = $('#kanban-grid');
  if (!grid) return;
  grid.addEventListener('dragstart', function(e) {
    var card = e.target.closest('.kcard'); if (!card) return;
    dragUid = card.getAttribute('data-uid');
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', dragUid); } catch (er) {}
  });
  grid.addEventListener('dragend', function(e) {
    var card = e.target.closest('.kcard'); if (card) card.classList.remove('dragging');
    $$('.kcol.drop-target').forEach(function(c) { c.classList.remove('drop-target'); });
    dragUid = null;
  });
  grid.addEventListener('dragover', function(e) {
    var col = e.target.closest('.kcol'); if (!col) return;
    e.preventDefault(); e.dataTransfer.dropEffect = 'move';
    $$('.kcol.drop-target').forEach(function(c) { if (c !== col) c.classList.remove('drop-target'); });
    col.classList.add('drop-target');
  });
  grid.addEventListener('drop', function(e) {
    var col = e.target.closest('.kcol'); if (!col || !dragUid) return;
    e.preventDefault();
    var nuevoEstado = col.getAttribute('data-state');
    var L = leads.find(function(x) { return x._uid === dragUid; });
    if (L && L.estado !== nuevoEstado) {
      L.estado = nuevoEstado;
      saveLeads();
      renderAll();
      toast('Movido a "' + nuevoEstado + '"');
    }
    col.classList.remove('drop-target');
  });
}

/* ---- Event delegation: cards / table ---- */
function bindDelegatedEvents() {
  // Cards
  $('#cards-grid').addEventListener('click', function(e) {
    var card = e.target.closest('.card'); if (!card) return;
    var uid = card.getAttribute('data-uid');
    var actEl = e.target.closest('[data-act]');
    if (actEl) { e.stopPropagation(); handleAction(uid, actEl.getAttribute('data-act')); return; }
    // click body de la card → abrir ver
    openView(uid);
  });

  // Table
  $('#table-body').addEventListener('click', function(e) {
    var tr = e.target.closest('tr'); if (!tr) return;
    var uid = tr.getAttribute('data-uid');
    var actEl = e.target.closest('[data-act]');
    if (actEl) { e.stopPropagation(); handleAction(uid, actEl.getAttribute('data-act')); return; }
    openView(uid);
  });

  // Table header checkbox
  $('#th-check').addEventListener('click', toggleAllVisible);

  // Kanban: click cards / add
  $('#kanban-grid').addEventListener('click', function(e) {
    var add = e.target.closest('[data-act="add-here"]');
    if (add) {
      var estado = add.getAttribute('data-state');
      var t = newLeadTemplate(); t.estado = estado;
      // Empujamos al array provisional con _isNew=true
      openEditFromTemplate(t);
      return;
    }
    var card = e.target.closest('.kcard'); if (!card) return;
    openView(card.getAttribute('data-uid'));
  });
}

function openEditFromTemplate(tpl) {
  currentLeadId = tpl._uid;
  editMode = true;
  $('#edit-title').textContent = 'Nuevo lead';
  $('#edit-body').innerHTML = buildEditBody(tpl);
  $('#edit-body').dataset.isNew = '1';
  // Necesitamos que saveEdit encuentre el lead → guardamos referencia provisional
  leads._pendingNew = tpl;
  openModal('modal-edit');
}

// Overwrite saveEdit para soportar el _pendingNew
var _saveEditOriginal = saveEdit;
saveEdit = function() {
  var body = $('#edit-body');
  var isNew = body.dataset.isNew === '1';
  var L;
  if (isNew) {
    L = leads._pendingNew || newLeadTemplate();
    delete leads._pendingNew;
  } else {
    L = leads.find(function(x) { return x._uid === currentLeadId; });
  }
  if (!L) return;
  if (!L._uid) L._uid = newUid('new');

  $$('[data-field]', body).forEach(function(el) {
    var key = el.getAttribute('data-field');
    var val = el.value;
    if (key === '_tags_csv') L.tags = val.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
    else L[key] = val;
  });

  if (!L.nombre_empresa || !L.nombre_empresa.trim()) { toast('Falta el nombre de empresa'); return; }

  if (isNew) { delete L._isNew; leads.unshift(L); }
  saveLeads();
  populateSectorFilter(); populateTagFilter();
  closeModal('modal-edit');
  renderAll();
  toast(isNew ? 'Lead creado' : 'Cambios guardados');
};

/* ---- Inicialización ---- */
function init() {
  leads = loadLeads();
  loadView();
  populateSectorFilter();
  populateTagFilter();
  loadFiltersFromLS();

  // Filtros
  $('#search').addEventListener('input', renderAll);
  ['#f-sector', '#f-prio', '#f-estado', '#f-tag', '#f-orden'].forEach(function(s) {
    $(s).addEventListener('change', renderAll);
  });

  // View toggle
  $$('.view-toggle button').forEach(function(b) {
    b.addEventListener('click', function() {
      currentView = b.dataset.view;
      saveView();
      updateViewToggle();
      renderAll();
    });
  });
  updateViewToggle();

  // Botones top
  $('#btn-new').addEventListener('click', function() { openEdit(null, true); });
  $('#btn-export-json').addEventListener('click', exportJSON);
  $('#btn-export-csv').addEventListener('click', exportCSV);
  $('#btn-import').addEventListener('click', function() { $('#file-import').click(); });
  $('#file-import').addEventListener('change', function(e) {
    var f = e.target.files && e.target.files[0];
    if (f) { importJSON(f); this.value = ''; }
  });

  // Modal view buttons
  $('#btn-edit-current').addEventListener('click', openEditCurrent);
  $('#btn-delete-current').addEventListener('click', function() {
    if (currentLeadId == null) return;
    var L = leads.find(function(x) { return x._uid === currentLeadId; });
    var name = L ? L.nombre_empresa : 'este lead';
    openConfirm('¿Eliminar "' + name + '"?', 'Esta acción no se puede deshacer.', function() {
      deleteLead(currentLeadId);
      closeModal('modal-view');
      toast('Lead eliminado');
    });
  });

  // Modal edit save
  $('#btn-save-edit').addEventListener('click', function() { saveEdit(); });

  // Modal cierre genérico
  $$('[data-close]').forEach(function(b) {
    b.addEventListener('click', function() { closeModal(b.getAttribute('data-close')); });
  });
  $$('.modal-overlay').forEach(function(o) {
    o.addEventListener('click', function(e) { if (e.target === o) closeModal(o.id); });
  });

  // Confirm
  $('#btn-confirm-ok').addEventListener('click', function() {
    var cb = confirmCallback; confirmCallback = null;
    closeModal('modal-confirm');
    if (cb) cb();
  });

  // Toast close
  $('#toast-close').addEventListener('click', function() { $('#toast').classList.remove('show'); });

  // Bulk
  $('#bulk-clear').addEventListener('click', clearSelection);
  $('#bulk-delete').addEventListener('click', bulkDelete);
  $('#bulk-add-tag').addEventListener('click', bulkAddTag);
  $('#bulk-estado').addEventListener('change', function() { if (this.value) { bulkSetField('estado', this.value); this.value = ''; } });
  $('#bulk-prio').addEventListener('change', function() { if (this.value) { bulkSetField('prioridad', this.value); this.value = ''; } });

  // Reset filters
  $('#btn-reset-filters').addEventListener('click', function() {
    $('#search').value = '';
    ['#f-sector', '#f-prio', '#f-estado', '#f-tag'].forEach(function(s) { $(s).value = ''; });
    $('#f-orden').value = 'smart';
    saveFiltersToLS();
    renderAll();
  });

  // Delegación cards/table/kanban
  bindDelegatedEvents();
  bindKanbanDnD();

  // Keyboard
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      var open = $$('.modal-overlay.show');
      if (open.length > 0) closeModal(open[open.length - 1].id);
    }
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault(); $('#search').focus();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); $('#search').focus(); }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') { e.preventDefault(); openEdit(null, true); }
  });

  renderAll();
}

document.addEventListener('DOMContentLoaded', init);
