/* ============================================================
   EsarIA CRM — app.js
   Vanilla JS, sin frameworks, compatible con file://
   ============================================================ */

'use strict';

/* ---- Datos demo ---- */
var DEMO_LEADS = [
  {
    id: "DEMO-001",
    nombre_empresa: "[DEMO] Clinica Dental Sonrisa",
    sector: "Clinica dental",
    ciudad: "Valladolid",
    telefono: "000 000 001",
    email: "demo@clinicasonrisa.ejemplo",
    web: "https://ejemplo.com/clinica",
    instagram: "@clinicasonrisa_demo",
    linkedin: "",
    direccion: "Calle Mayor, 10, 47001 Valladolid",
    decisor_nombre: "Dra. Ana Garcia",
    decisor_cargo: "Directora / Propietaria",
    fuente_datos: "DEMO — dato ficticio, no contactar",
    problema_visible: "Gestion manual de citas por telefono y muchas cancelaciones de ultima hora",
    oportunidad_automatizacion: "Sistema de citas online + recordatorios automaticos por WhatsApp + respuesta a FAQ habituales",
    prioridad: "Alta",
    facilidad_contacto: "Media",
    tipo_reunion_recomendada: "Presencial",
    mensaje_llamada_personalizado: "Hola Ana, soy Javier de EsarIA. He visto que gestionais las citas principalmente por telefono. Tenemos una solucion que reduce cancelaciones y ahorra tiempo al equipo en la agenda. ¿Te puedo comentar en 2 minutos?",
    mensaje_whatsapp_personalizado: "Hola Ana, soy Javier de EsarIA. Te he llamado antes. Trabajamos con clinicas dentales para automatizar la gestion de citas y recordatorios. ¿Le viene bien esta semana 20 minutos para un diagnostico gratuito? Sin compromiso.",
    estado: "Nuevo",
    notas: "Lead de demostracion. No contactar."
  },
  {
    id: "DEMO-002",
    nombre_empresa: "[DEMO] Taller Mecanico AutoFix",
    sector: "Taller mecanico",
    ciudad: "Valladolid",
    telefono: "000 000 002",
    email: "demo@autofix.ejemplo",
    web: "https://ejemplo.com/taller",
    instagram: "@autofix_demo",
    linkedin: "",
    direccion: "Poligono Industrial Norte, 47009 Valladolid",
    decisor_nombre: "Carlos Martinez",
    decisor_cargo: "Gerente / Propietario",
    fuente_datos: "DEMO — dato ficticio, no contactar",
    problema_visible: "Los clientes llaman para saber el estado de su coche y no hay sistema de avisos automaticos",
    oportunidad_automatizacion: "Avisos automaticos de estado de reparacion + envio de presupuestos por WhatsApp + recordatorios de ITV",
    prioridad: "Media",
    facilidad_contacto: "Alta",
    tipo_reunion_recomendada: "Presencial",
    mensaje_llamada_personalizado: "Hola Carlos, soy Javier de EsarIA. He visto que en vuestro taller recibis muchas llamadas para saber el estado de los coches. Tenemos una solucion para avisarles automaticamente. ¿Te cuento en 2 minutos?",
    mensaje_whatsapp_personalizado: "Hola Carlos, soy Javier de EsarIA. Trabajamos con talleres para automatizar avisos de reparacion y presupuestos por WhatsApp. ¿Tienes 20 minutos esta semana para un diagnostico gratuito?",
    estado: "Nuevo",
    notas: "Lead de demostracion. No contactar."
  },
  {
    id: "DEMO-003",
    nombre_empresa: "[DEMO] Gym Valladolid Center",
    sector: "Gimnasio",
    ciudad: "Valladolid",
    telefono: "000 000 003",
    email: "demo@gymvlc.ejemplo",
    web: "https://ejemplo.com/gym",
    instagram: "@gymvlc_demo",
    linkedin: "",
    direccion: "Avenida del Deporte, 5, 47011 Valladolid",
    decisor_nombre: "Pedro Sanchez",
    decisor_cargo: "Director / Propietario",
    fuente_datos: "DEMO — dato ficticio, no contactar",
    problema_visible: "Alta tasa de bajas de socios y proceso de captacion totalmente manual",
    oportunidad_automatizacion: "Automatizacion de captacion + onboarding de nuevos socios + recordatorios de renovacion",
    prioridad: "Alta",
    facilidad_contacto: "Alta",
    tipo_reunion_recomendada: "Presencial",
    mensaje_llamada_personalizado: "Hola Pedro, soy Javier de EsarIA. He visto que teneis un gimnasio con buena presencia en Instagram. Trabajamos con centros deportivos para automatizar la captacion de nuevos socios y evitar bajas. ¿Te puedo contar en 2 minutos?",
    mensaje_whatsapp_personalizado: "Hola Pedro, soy Javier de EsarIA. Ayudamos a gimnasios a automatizar captacion de socios y reducir bajas. ¿Tienes 20 minutos esta semana para un diagnostico gratuito?",
    estado: "Investigado",
    notas: "Lead de demostracion. No contactar."
  },
  {
    id: "DEMO-004",
    nombre_empresa: "[DEMO] Fisioterapia Activa Valladolid",
    sector: "Fisioterapia",
    ciudad: "Valladolid",
    telefono: "000 000 004",
    email: "demo@fisioactiva.ejemplo",
    web: "https://ejemplo.com/fisio",
    instagram: "@fisioactiva_demo",
    linkedin: "",
    direccion: "Calle Reconquista, 22, 47005 Valladolid",
    decisor_nombre: "Laura Gomez",
    decisor_cargo: "Fisioterapeuta / Propietaria",
    fuente_datos: "DEMO — dato ficticio, no contactar",
    problema_visible: "Agenda gestionada por WhatsApp y telefono con muchas horas perdidas en coordinacion",
    oportunidad_automatizacion: "Sistema de citas online + recordatorios automaticos + respuestas a FAQ por WhatsApp",
    prioridad: "Alta",
    facilidad_contacto: "Alta",
    tipo_reunion_recomendada: "Presencial",
    mensaje_llamada_personalizado: "Hola Laura, soy Javier de EsarIA. He visto que gestionais las citas por WhatsApp. Tenemos una solucion que automatiza eso y os libera tiempo para atender pacientes. ¿Te cuento en 2 minutos?",
    mensaje_whatsapp_personalizado: "Hola Laura, soy Javier de EsarIA. Trabajamos con fisioterapeutas para automatizar citas y recordatorios. ¿Tienes 20 minutos esta semana para un diagnostico gratuito? Sin compromiso.",
    estado: "Llamado",
    notas: "Lead de demostracion. No contactar."
  },
  {
    id: "DEMO-005",
    nombre_empresa: "[DEMO] Academia Idiomas Plus",
    sector: "Academia",
    ciudad: "Valladolid",
    telefono: "000 000 005",
    email: "demo@idiomasplus.ejemplo",
    web: "https://ejemplo.com/academia",
    instagram: "@idiomasplus_demo",
    linkedin: "",
    direccion: "Plaza de Espana, 3, 47002 Valladolid",
    decisor_nombre: "Isabel Torres",
    decisor_cargo: "Directora / Propietaria",
    fuente_datos: "DEMO — dato ficticio, no contactar",
    problema_visible: "Proceso de matriculacion manual y sin seguimiento sistematizado de alumnos interesados",
    oportunidad_automatizacion: "Automatizacion de matriculacion + seguimiento de leads + recordatorios de inicio de curso",
    prioridad: "Media",
    facilidad_contacto: "Media",
    tipo_reunion_recomendada: "Videollamada",
    mensaje_llamada_personalizado: "Hola Isabel, soy Javier de EsarIA. He visto que teneis una academia de idiomas en el centro. Trabajamos con academias para automatizar captacion y matriculacion. ¿Te puedo comentar en 2 minutos?",
    mensaje_whatsapp_personalizado: "Hola Isabel, soy Javier de EsarIA. Ayudamos a academias a automatizar matriculacion y seguimiento de alumnos interesados. ¿Tienes 20 minutos esta semana para un diagnostico gratuito?",
    estado: "Nuevo",
    notas: "Lead de demostracion. No contactar."
  }
];

/* ---- Estado global ---- */
var leads = [];
var filteredLeads = [];
var currentLeadId = null;

/* ---- Inicializacion ---- */
function init() {
  leads = loadLeads();
  filteredLeads = leads.slice();

  populateSectorFilter();
  renderStats();
  renderCards(filteredLeads);
  bindEvents();
}

/* ---- LocalStorage ---- */
var LS_KEY = 'esaria_leads';

function loadLeads() {
  try {
    var raw = localStorage.getItem(LS_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return DEMO_LEADS.slice();
}

function saveLeads() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(leads));
  } catch (e) {}
}

/* ---- Stats ---- */
function renderStats() {
  var total = leads.length;
  var alta = leads.filter(function(l) { return l.prioridad === 'Alta'; }).length;
  var reunion = leads.filter(function(l) { return l.estado === 'Reunion agendada'; }).length;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-alta').textContent = alta;
  document.getElementById('stat-reunion').textContent = reunion;
}

/* ---- Filtro de sectores dinamico ---- */
function populateSectorFilter() {
  var select = document.getElementById('filter-sector');
  var sectores = [];
  leads.forEach(function(l) {
    if (l.sector && sectores.indexOf(l.sector) === -1) sectores.push(l.sector);
  });
  sectores.sort();
  sectores.forEach(function(s) {
    var opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    select.appendChild(opt);
  });
}

/* ---- Filtrado ---- */
function applyFilters() {
  var q = document.getElementById('search-input').value.toLowerCase().trim();
  var sector = document.getElementById('filter-sector').value;
  var prioridad = document.getElementById('filter-prioridad').value;
  var estado = document.getElementById('filter-estado').value;

  filteredLeads = leads.filter(function(l) {
    if (q) {
      var haystack = [l.nombre_empresa, l.sector, l.ciudad, l.decisor_nombre].join(' ').toLowerCase();
      if (haystack.indexOf(q) === -1) return false;
    }
    if (sector && l.sector !== sector) return false;
    if (prioridad && l.prioridad !== prioridad) return false;
    if (estado && l.estado !== estado) return false;
    return true;
  });

  renderCards(filteredLeads);
}

/* ---- Render tarjetas ---- */
function renderCards(list) {
  var grid = document.getElementById('leads-grid');
  grid.innerHTML = '';

  if (list.length === 0) {
    var empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = '<strong>Sin resultados</strong><p>Ajusta los filtros o importa un fichero JSON de leads.</p>';
    grid.appendChild(empty);
    return;
  }

  list.forEach(function(lead) {
    grid.appendChild(buildCard(lead));
  });
}

function buildCard(lead) {
  var card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('data-id', lead.id);

  var prioClass = badgePrioridadClass(lead.prioridad);
  var estadoClass = badgeEstadoClass(lead.estado);

  var webBtn = lead.web
    ? '<button class="btn btn-ghost btn-sm btn-web">Web</button>'
    : '';

  card.innerHTML =
    '<div class="card-header">' +
      '<div class="card-title">' + esc(lead.nombre_empresa) + '</div>' +
      '<div class="card-badges">' +
        '<span class="badge badge-sector">' + esc(lead.sector) + '</span>' +
        '<span class="badge ' + prioClass + '">' + esc(lead.prioridad) + '</span>' +
        '<span class="badge ' + estadoClass + '">' + esc(lead.estado) + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="card-meta">' +
      '<span>' + esc(lead.ciudad) + '</span>' +
      '<span>' + esc(lead.decisor_nombre) + '</span>' +
    '</div>' +
    '<div class="card-problema">' + esc(lead.problema_visible) + '</div>' +
    '<div class="card-actions">' +
      '<button class="btn btn-primary btn-sm btn-ver">Ver</button>' +
      '<button class="btn btn-ghost btn-sm btn-copy-tel">Copiar telefono</button>' +
      '<button class="btn btn-ghost btn-sm btn-whatsapp">WhatsApp</button>' +
      webBtn +
    '</div>';

  /* Eventos de la card */
  card.querySelector('.btn-ver').addEventListener('click', function() {
    openModal(lead.id);
  });

  card.querySelector('.btn-copy-tel').addEventListener('click', function() {
    copyText(lead.telefono, 'Telefono copiado');
  });

  card.querySelector('.btn-whatsapp').addEventListener('click', function() {
    openWhatsApp(lead.telefono, lead.mensaje_whatsapp_personalizado);
  });

  if (lead.web) {
    card.querySelector('.btn-web').addEventListener('click', function() {
      window.open(lead.web, '_blank', 'noopener');
    });
  }

  return card;
}

/* ---- Modal ---- */
function openModal(id) {
  var lead = leads.find(function(l) { return l.id === id; });
  if (!lead) return;
  currentLeadId = id;

  var content = document.getElementById('modal-content');
  content.innerHTML = buildModalHTML(lead);

  /* Eventos dentro del modal */
  /* Estado */
  var estadoSelect = content.querySelector('#modal-estado-select');
  estadoSelect.addEventListener('change', function() {
    updateLeadField(id, 'estado', this.value);
    /* Actualizar badge de la card en background */
    renderStats();
    applyFilters();
  });

  /* Notas */
  var notasTA = content.querySelector('#modal-notas');
  notasTA.addEventListener('blur', function() {
    updateLeadField(id, 'notas', this.value);
  });

  /* Copiar guion llamada */
  content.querySelector('#btn-copy-llamada').addEventListener('click', function() {
    copyText(lead.mensaje_llamada_personalizado, 'Guion copiado');
  });

  /* Copiar guion recepcion */
  var btnRecepcion = content.querySelector('#btn-copy-recepcion');
  if (btnRecepcion) {
    btnRecepcion.addEventListener('click', function() {
      copyText(lead.guion_recepcion_personalizado, 'Guion de recepcion copiado');
    });
  }

  /* Copiar mensaje WA */
  content.querySelector('#btn-copy-wa').addEventListener('click', function() {
    copyText(lead.mensaje_whatsapp_personalizado, 'Mensaje copiado');
  });

  /* Abrir WA */
  content.querySelector('#btn-open-wa').addEventListener('click', function() {
    openWhatsApp(lead.telefono, lead.mensaje_whatsapp_personalizado);
  });

  /* Copiar telefono en modal */
  content.querySelector('#btn-copy-tel-modal').addEventListener('click', function() {
    copyText(lead.telefono, 'Telefono copiado');
  });

  /* Copiar email */
  content.querySelector('#btn-copy-email').addEventListener('click', function() {
    copyText(lead.email, 'Email copiado');
  });

  /* Mostrar modal */
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.body.style.overflow = '';
  currentLeadId = null;
}

function buildModalHTML(lead) {
  var estadoOpts = ['Nuevo', 'Investigado', 'Llamado', 'Reunion agendada', 'Descartado'];

  var estadoOptions = estadoOpts.map(function(s) {
    var sel = s === lead.estado ? ' selected' : '';
    return '<option value="' + esc(s) + '"' + sel + '>' + esc(s) + '</option>';
  }).join('');

  var webLink = lead.web
    ? '<a href="' + esc(lead.web) + '" target="_blank" rel="noopener">' + esc(lead.web) + '</a>'
    : '<span>—</span>';

  var igLink = lead.instagram
    ? '<a href="https://instagram.com/' + encodeURIComponent(lead.instagram.replace('@','')) + '" target="_blank" rel="noopener">' + esc(lead.instagram) + '</a>'
    : '<span>—</span>';

  var liLink = lead.linkedin
    ? '<a href="' + esc(lead.linkedin) + '" target="_blank" rel="noopener">' + esc(lead.linkedin) + '</a>'
    : '<span>—</span>';

  var candidatosHTML = buildCandidatosHTML(lead.candidatos_decisor);

  return (
    /* EMPRESA */
    '<div class="modal-section">' +
      '<div class="modal-empresa-name">' + esc(lead.nombre_empresa) + '</div>' +
      '<div class="card-badges" style="margin-bottom:12px;">' +
        '<span class="badge badge-sector">' + esc(lead.sector) + '</span>' +
        '<span class="badge ' + badgePrioridadClass(lead.prioridad) + '">' + esc(lead.prioridad) + '</span>' +
        '<span class="badge ' + badgeEstadoClass(lead.estado) + '">' + esc(lead.estado) + '</span>' +
      '</div>' +
      '<div class="modal-section-title">Empresa</div>' +
      '<div class="modal-grid">' +
        field('Ciudad', lead.ciudad) +
        field('Sector', lead.sector) +
        fieldFull('Direccion', lead.direccion || '—') +
        fieldHTML('Web', webLink) +
        fieldHTML('Instagram', igLink) +
        fieldHTML('LinkedIn', liLink) +
        field('Decisor', lead.decisor_nombre) +
        field('Cargo', lead.decisor_cargo) +
        field('Confianza decisor', lead.confianza_decisor) +
        fieldFull('Fuente decisor', lead.fuente_decisor) +
        fieldFull('Evidencia decisor', lead.evidencia_decisor) +
        fieldHTMLFull('Candidatos decisor', candidatosHTML) +
      '</div>' +
    '</div>' +

    /* ANALISIS */
    '<div class="modal-section">' +
      '<div class="modal-section-title">Analisis</div>' +
      '<div class="modal-grid">' +
        fieldFull('Problema visible', lead.problema_visible) +
        fieldFull('Oportunidad de automatizacion', lead.oportunidad_automatizacion) +
        field('Prioridad', lead.prioridad) +
        field('Facilidad de contacto', lead.facilidad_contacto) +
        field('Tipo de reunion recomendada', lead.tipo_reunion_recomendada) +
      '</div>' +
    '</div>' +

    /* CONTACTO */
    '<div class="modal-section">' +
      '<div class="modal-section-title">Contacto</div>' +
      '<div class="modal-grid">' +
        '<div class="modal-field">' +
          '<label>Telefono</label>' +
          '<div class="copy-field">' +
            '<span>' + esc(lead.telefono) + '</span>' +
            '<button class="btn btn-ghost btn-sm" id="btn-copy-tel-modal">Copiar</button>' +
          '</div>' +
        '</div>' +
        '<div class="modal-field">' +
          '<label>Email</label>' +
          '<div class="copy-field">' +
            '<span>' + esc(lead.email) + '</span>' +
            '<button class="btn btn-ghost btn-sm" id="btn-copy-email">Copiar</button>' +
          '</div>' +
        '</div>' +
        fieldFull('Fuente de datos', lead.fuente_datos) +
      '</div>' +
    '</div>' +

    /* GUION RECEPCION */
    '<div class="modal-section">' +
      '<div class="modal-section-title">Guion recepcion</div>' +
      '<div class="script-box">' + esc(lead.guion_recepcion_personalizado) + '</div>' +
      '<div class="copy-row">' +
        '<button class="btn btn-secondary btn-sm" id="btn-copy-recepcion">Copiar guion recepción</button>' +
      '</div>' +
    '</div>' +

    /* GUION LLAMADA */
    '<div class="modal-section">' +
      '<div class="modal-section-title">Guion de llamada</div>' +
      '<div class="script-box">' + esc(lead.mensaje_llamada_personalizado) + '</div>' +
      '<div class="copy-row">' +
        '<button class="btn btn-secondary btn-sm" id="btn-copy-llamada">Copiar guion</button>' +
      '</div>' +
    '</div>' +

    /* WHATSAPP */
    '<div class="modal-section">' +
      '<div class="modal-section-title">WhatsApp</div>' +
      '<div class="script-box">' + esc(lead.mensaje_whatsapp_personalizado) + '</div>' +
      '<div class="copy-row">' +
        '<button class="btn btn-secondary btn-sm" id="btn-copy-wa">Copiar mensaje</button>' +
        '<button class="btn btn-primary btn-sm" id="btn-open-wa">Abrir WhatsApp</button>' +
      '</div>' +
    '</div>' +

    /* ESTADO Y NOTAS */
    '<div class="modal-section">' +
      '<div class="modal-section-title">Estado y notas</div>' +
      '<div class="estado-row">' +
        '<select class="estado-select" id="modal-estado-select">' + estadoOptions + '</select>' +
      '</div>' +
      '<textarea class="notas-textarea" id="modal-notas" placeholder="Notas internas...">' + esc(lead.notas || '') + '</textarea>' +
    '</div>'
  );
}

/* ---- Helpers HTML ---- */
function field(label, value) {
  return '<div class="modal-field"><label>' + label + '</label><span>' + esc(value || '—') + '</span></div>';
}

function fieldFull(label, value) {
  return '<div class="modal-field modal-field-full"><label>' + label + '</label><span>' + esc(value || '—') + '</span></div>';
}

function fieldHTML(label, html) {
  return '<div class="modal-field"><label>' + label + '</label>' + html + '</div>';
}

function fieldHTMLFull(label, html) {
  return '<div class="modal-field modal-field-full"><label>' + label + '</label>' + html + '</div>';
}

function buildCandidatosHTML(candidatos) {
  if (!Array.isArray(candidatos) || candidatos.length === 0) return '<span>—</span>';
  return '<div class="script-box">' + candidatos.map(function(c) {
    var parts = [];
    if (c.nombre) parts.push(c.nombre);
    if (c.cargo) parts.push(c.cargo);
    if (c.confianza) parts.push('Confianza: ' + c.confianza);
    if (c.fuente) parts.push('Fuente: ' + c.fuente);
    if (c.evidencia) parts.push('Evidencia: ' + c.evidencia);
    return esc(parts.join(' | '));
  }).join('<br><br>') + '</div>';
}

/* ---- Actualizar lead ---- */
function updateLeadField(id, key, value) {
  var lead = leads.find(function(l) { return l.id === id; });
  if (!lead) return;
  lead[key] = value;
  saveLeads();
}

/* ---- Clipboard ---- */
function copyText(text, msg) {
  if (!text) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      showToast(msg || 'Copiado');
    }).catch(function() {
      fallbackCopy(text, msg);
    });
  } else {
    fallbackCopy(text, msg);
  }
}

function fallbackCopy(text, msg) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand('copy');
    showToast(msg || 'Copiado');
  } catch (e) {}
  document.body.removeChild(ta);
}

/* ---- WhatsApp ---- */
function openWhatsApp(telefono, mensaje) {
  var num = (telefono || '').replace(/\s/g, '').replace(/[^\d+]/g, '');
  var url = 'https://wa.me/' + encodeURIComponent(num) + '?text=' + encodeURIComponent(mensaje || '');
  window.open(url, '_blank', 'noopener');
}

/* ---- Toast ---- */
var toastTimer = null;
function showToast(msg) {
  var toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  toast.style.opacity = '1';
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function() {
    toast.style.opacity = '0';
    setTimeout(function() { toast.classList.add('hidden'); }, 300);
  }, 2000);
}

/* ---- Badges ---- */
function badgePrioridadClass(p) {
  if (p === 'Alta') return 'badge-alta';
  if (p === 'Baja') return 'badge-baja';
  return 'badge-media';
}

function badgeEstadoClass(e) {
  var map = {
    'Nuevo': 'badge-nuevo',
    'Investigado': 'badge-investigado',
    'Llamado': 'badge-llamado',
    'Reunion agendada': 'badge-reunion',
    'Descartado': 'badge-descartado'
  };
  return map[e] || 'badge-nuevo';
}

/* ---- Escape HTML ---- */
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ---- Importar / Exportar JSON ---- */
function exportJSON() {
  var blob = new Blob([JSON.stringify(leads, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'esaria-leads.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('JSON exportado');
}

function importJSON(file) {
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error('El archivo no contiene un array de leads.');
      leads = data;
      saveLeads();
      reloadUI();
      showToast(data.length + ' leads importados');
    } catch (err) {
      alert('Error al importar: ' + err.message);
    }
  };
  reader.readAsText(file);
}

/* Importar leads reales — reemplaza los DEMO y guarda en localStorage */
function importLeadsReales(file) {
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error('El archivo no contiene un array de leads.');
      if (data.length === 0) {
        showToast('El archivo está vacío (0 leads)');
        return;
      }
      leads = data;
      saveLeads();
      reloadUI();
      showToast(data.length + ' leads reales importados');
    } catch (err) {
      alert('Error al importar leads reales: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function reloadUI() {
  var select = document.getElementById('filter-sector');
  while (select.options.length > 1) select.remove(1);
  populateSectorFilter();
  renderStats();
  applyFilters();
}

/* ---- Eventos ---- */
function bindEvents() {
  /* Filtros */
  document.getElementById('search-input').addEventListener('input', applyFilters);
  document.getElementById('filter-sector').addEventListener('change', applyFilters);
  document.getElementById('filter-prioridad').addEventListener('change', applyFilters);
  document.getElementById('filter-estado').addEventListener('change', applyFilters);

  /* Import / Export */
  document.getElementById('btn-export').addEventListener('click', exportJSON);

  document.getElementById('btn-import').addEventListener('click', function() {
    document.getElementById('file-import').click();
  });

  document.getElementById('file-import').addEventListener('change', function(e) {
    var file = e.target.files && e.target.files[0];
    if (file) {
      importJSON(file);
      this.value = '';
    }
  });

  /* Botón "Importar leads reales" — inyectado dinámicamente */
  var filterActions = document.querySelector('.filter-actions');
  if (filterActions) {
    var btnReales = document.createElement('button');
    btnReales.className = 'btn btn-primary';
    btnReales.id = 'btn-import-reales';
    btnReales.title = 'Selecciona prospecting/leads/reales/leads-reales.json';
    btnReales.textContent = 'Importar leads reales';

    var fileReales = document.createElement('input');
    fileReales.type = 'file';
    fileReales.id = 'file-import-reales';
    fileReales.accept = '.json';
    fileReales.style.display = 'none';

    filterActions.insertBefore(btnReales, filterActions.firstChild);
    filterActions.appendChild(fileReales);

    btnReales.addEventListener('click', function() {
      fileReales.click();
    });

    fileReales.addEventListener('change', function(e) {
      var file = e.target.files && e.target.files[0];
      if (file) {
        importLeadsReales(file);
        this.value = '';
      }
    });
  }

  /* Modal cierre */
  document.getElementById('modal-close').addEventListener('click', closeModal);

  document.getElementById('modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
  });
}

/* ---- Arranque ---- */
document.addEventListener('DOMContentLoaded', init);
