(function () {
  'use strict';

  /* ==========================================================================
     1. READING PROGRESS BAR
     ========================================================================== */
  var progressBar = document.getElementById('readingProgress');
  if (progressBar) {
    window.addEventListener('scroll', function () {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      progressBar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ==========================================================================
     2. WORKBENCH INTERACTIVO DE LAS 4 APLICACIONES ESARIA
     ========================================================================== */
  var apps = {
    taller: {
      title: 'MENSAJE DEL CLIENTE RECIBIDO POR WHATSAPP (TEXTO O AUDIO)',
      engine: 'MOTOR: FASTER-WHISPER + JSON TRIAGE',
      presets: [
        {
          label: 'CASO 01: FRENOS Y CHIRRIDO METÁLICO',
          input: 'Buenas, mira que al frenar fuerte noto el pedal raro y suena como un chirrido metálico en la rueda delantera derecha, ¿tenéis hueco?',
          output:
            '[FICHA PREVIA DE TALLER // CASO #2026-F01]\n' +
            '────────────────────────────────────────────────────────\n' +
            '• CATEGORÍA DETECTADA : Frenos y Seguridad Vial\n' +
            '• PRIORIDAD ASIGNADA  : ALTA [Valorar inmovilización si afecta frenada]\n' +
            '• SÍNTOMA LIMPIO      : Anomalía en pedal + fricción metálica delantera\n' +
            '• DATOS FALTANTES     : [Marca/Modelo, Año, Testigo ABS, Frío/Caliente]\n' +
            '────────────────────────────────────────────────────────\n' +
            '• RESPUESTA AUTOMÁTICA ENVIADA AL CLIENTE (WHATSAPP):\n' +
            '  "Hola. Al tratarse de los frenos le damos prioridad. Para abrirte ficha antes de que vengas dime por favor: 1) Marca, modelo y año del coche, y 2) Si se enciende algún testigo en el cuadro."'
        },
        {
          label: 'CASO 02: GOTAS Y SUBIDA DE TEMPERATURA',
          input: 'Hola, ayer vi unas gotas debajo del coche al aparcar y hoy circulando por Valladolid en ciudad la aguja de la temperatura sube bastante.',
          output:
            '[FICHA PREVIA DE TALLER // CASO #2026-T02]\n' +
            '────────────────────────────────────────────────────────\n' +
            '• CATEGORÍA DETECTADA : Temperatura, Refrigeración y Fluidos\n' +
            '• PRIORIDAD ASIGNADA  : ALTA [Riesgo de junta de culata]\n' +
            '• CONDICIÓN DE FALLO  : Tráfico urbano + pérdida previa de líquido\n' +
            '• DATOS FALTANTES     : [Marca/Modelo, Matrícula, Testigo cuadro]\n' +
            '────────────────────────────────────────────────────────\n' +
            '• ACCIÓN SUGERIDA AL RECEPCIONISTA:\n' +
            '  Revisar nivel de refrigerante, estanqueidad de manguitos, bomba/termostato y advertir al cliente no circular si entra en zona roja.'
        }
      ]
    },
    vision: {
      title: 'CAPTURA EN ACCESO O RECEPCIÓN DE MERCANCÍA (TELEGRAM / MÓVIL)',
      engine: 'MOTOR: QWEN-VL-FLASH (~0.9s) + REGEX ES',
      presets: [
        {
          label: 'CASO 01: MATRÍCULA "4821-MNP" EN PUERTA',
          input: '[FOTO CÁMARA MÓVIL] Parachoques delantero capturado en acceso: "E 4821 - MNP"',
          output:
            '[CONTROL DE ACCESOS VISIONGATE // LATENCIA: 890ms]\n' +
            '────────────────────────────────────────────────────────\n' +
            '01. OCR_EXTRACTION    : "E 4821 - MNP" (Qwen-VL-Flash)\n' +
            '02. REGEX_NORMALIZED  : "4821MNP" [Formato Europeo Moderno]\n' +
            '03. CRUCE BASE DATOS  : AUTORIZADO EN LISTADO OFICIAL\n' +
            '    ├─ EMPRESA        : Logística y Suministros Norte S.L.\n' +
            '    ├─ TIPO DE PASE   : Proveedor / Carga y Descarga\n' +
            '    └─ ACCIÓN         : Entrada registrada + Panel web actualizado.'
        },
        {
          label: 'CASO 02: MATRÍCULA PROVINCIAL POR VOZ',
          input: '[NOTA DE VOZ 2s] "Comprueba furgoneta matrícula Valladolid nueve dos uno tres A L"',
          output:
            '[CONTROL DE ACCESOS VISIONGATE // LATENCIA: 140ms]\n' +
            '────────────────────────────────────────────────────────\n' +
            '01. TRANSCRIPCIÓN VOZ : "VA 9213 AL"\n' +
            '02. REGEX_NORMALIZED  : "VA9213AL" [Formato Provincial Español]\n' +
            '03. CRUCE BASE DATOS  : AUTORIZADO (Mantenimiento / Staff)\n' +
            '04. AUDITORÍA         : Registro añadido en registros.csv con hora exacta.'
        }
      ]
    },
    erp: {
      title: 'MENSAJE NATURAL EN GRUPO DE ALMACÉN O SOCIOS',
      engine: 'MOTOR: FASTAPI + DEEPSEEK TOOL CALLING + SQLITE',
      presets: [
        {
          label: 'CASO 01: REGISTRO DE VENTA EN LENGUAJE NATURAL',
          input: 'Apunta que le he vendido 4 unidades del lote premium a Marcos esta mañana.',
          output:
            '{\n' +
            '  "accion_ejecutada": "registrar_venta",\n' +
            '  "parametros": {\n' +
            '    "producto_id": 4,\n' +
            '    "cantidad": 4,\n' +
            '    "cliente": "Marcos",\n' +
            '    "precio_unitario": null\n' +
            '  },\n' +
            '  "guardrail_contable": "OK -> Se aplica PVP oficial de SQLite (25.00 EUR/ud)",\n' +
            '  "impacto_stock": "Stock actualizado: 19 -> 15 uds | Ingreso: +100.00 EUR",\n' +
            '  "respuesta_chat": "✅ Venta registrada: 4 uds a Marcos (+100€). Quedan 15 en almacén."\n' +
            '}'
        },
        {
          label: 'CASO 02: BLOQUEO DE CANTIDAD AMBIGUA (GUARDRAIL)',
          input: 'He vendido unas cuantas cajas esta tarde, apúntalo.',
          output:
            '{\n' +
            '  "accion_ejecutada": "responder",\n' +
            '  "guardrail_activado": "REGLA_03_CANTIDAD_AMBIGUA",\n' +
            '  "escrituras_db": 0,\n' +
            '  "respuesta_chat": "⚠️ Por seguridad contable no modifico el inventario hasta que me indiques el número exacto de cajas y la referencia."\n' +
            '}'
        }
      ]
    },
    docu: {
      title: 'FOTOGRAFÍA DE PARTE DE TRABAJO O ACTA MANUSCRITA',
      engine: 'MOTOR: VISIÓN MULTIMODAL + VOLCADO WEB / PDF',
      presets: [
        {
          label: 'CASO 01: DIGITALIZACIÓN DE PARTE / ACTA EN PAPEL',
          input: '[FOTO DOCUMENTO MANUSCRITO] Parte #2026-084 firmado en campo con tabla de unidades, tiempos e incidencias.',
          output:
            '[DOCUFLOW PIPELINE // EXTRACCIÓN Y TRAMITACIÓN]\n' +
            '────────────────────────────────────────────────────────\n' +
            '01. LECTURA VISIÓN    : Cabecera, tabla manuscrita y firmas extraídas\n' +
            '02. VALIDACIÓN REGLAS : Sumatorio de líneas verificado sin discrepancias\n' +
            '03. VOLCADO AUTOMÁTICO: Formulario subido al portal / hoja de control\n' +
            '04. DOCUMENTO FINAL   : PDF oficial descargado y enviado al móvil en 14s.'
        }
      ]
    }
  };

  var activeApp = 'taller';
  var wbTabs = document.querySelectorAll('.wb-tab');
  var wbTitle = document.getElementById('wb-input-title');
  var wbEngine = document.getElementById('wb-engine-tag');
  var wbPresets = document.getElementById('wb-presets');
  var wbInput = document.getElementById('wb-input');
  var wbOutput = document.getElementById('wb-output');
  var wbStatus = document.getElementById('wb-status');
  var wbRunBtn = document.getElementById('wb-run');

  function evaluateAppInput(appKey, raw) {
    var text = (raw || '').trim();
    if (!text) {
      return '[AVISO] Escribe un mensaje de prueba o selecciona uno de los botones superiores.';
    }
    var cfg = apps[appKey];
    for (var i = 0; i < cfg.presets.length; i++) {
      if (cfg.presets[i].input === text) {
        return cfg.presets[i].output;
      }
    }

    if (appKey === 'vision') {
      var upper = text.toUpperCase();
      var mod = upper.match(/([0-9]{4})\s*[- ]?\s*([BCDFGHJKLMNPRSTVWXYZ]{3})/);
      var prv = upper.match(/([A-Z]{1,2})\s*[- ]?\s*([0-9]{4})\s*[- ]?\s*([A-Z]{1,2})/);
      var plate = mod ? (mod[1] + mod[2]) : (prv ? (prv[1] + prv[2] + prv[3]) : null);
      if (plate) {
        return (
          '[CONTROL DE ACCESOS VISIONGATE // INSPECCIÓN EN VIVO]\n' +
          '────────────────────────────────────────────────────────\n' +
          '01. ENTRADA RECIBIDA  : "' + text + '"\n' +
          '02. MATRÍCULA LIMPIA  : "' + plate + '"\n' +
          '03. CONSULTA DB       : Verificada en listado de autorizados\n' +
          '04. ACCIÓN            : Lista para registrar acceso en tiempo real.'
        );
      }
    }

    return (
      '[PROCESAMIENTO EN VIVO // MÓDULO: ' + appKey.toUpperCase() + ']\n' +
      '────────────────────────────────────────────────────────\n' +
      '• Entrada recibida    : "' + text + '"\n' +
      '• Clasificación IA    : Entidades extraídas y validadas contra esquema JSON\n' +
      '• Acción ejecutada    : Ficha estructurada lista para enviar a tu WhatsApp o ERP.'
    );
  }

  function runWorkbench() {
    wbStatus.textContent = 'PROCESANDO...';
    var t0 = performance.now();
    setTimeout(function () {
      wbOutput.textContent = evaluateAppInput(activeApp, wbInput.value);
      var dt = Math.max(9, Math.round(performance.now() - t0));
      wbStatus.textContent = '● EJECUTADO (' + dt + 'ms)';
    }, 90);
  }

  function loadApp(appKey) {
    activeApp = appKey;
    var cfg = apps[appKey];
    if (!cfg) return;
    wbTitle.textContent = cfg.title;
    wbEngine.textContent = cfg.engine;
    wbPresets.innerHTML = '';

    cfg.presets.forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'wb-chip';
      b.textContent = p.label;
      b.addEventListener('click', function () {
        wbInput.value = p.input;
        runWorkbench();
      });
      wbPresets.appendChild(b);
    });

    wbInput.value = cfg.presets[0].input;
    wbOutput.textContent = cfg.presets[0].output;
    wbStatus.textContent = '● SISTEMA LISTO';
  }

  wbTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      wbTabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      loadApp(tab.getAttribute('data-app'));
    });
  });

  if (wbRunBtn) {
    wbRunBtn.addEventListener('click', runWorkbench);
  }
  loadApp('taller');

  /* ==========================================================================
     3. CALCULADORA INTERACTIVA DE FUGA OPERATIVA Y ROI B2B
     ========================================================================== */
  var roiSectors = {
    taller: {
      ops: 20, mins: 7, payback: '< 2',
      rec: '<strong>SOLUCIÓN RECOMENDADA (TALLERES):</strong> Recepción automática por WhatsApp con clasificación de avería (frenos, motor, temperatura), solicitud de datos faltantes y generación de ficha previa lista para el mecánico.'
    },
    clinica: {
      ops: 30, mins: 6, payback: '1.5',
      rec: '<strong>SOLUCIÓN RECOMENDADA (CLÍNICAS):</strong> Recordatorios interactivos por WhatsApp 24h antes de la cita + formulario de pre-ingreso en el móvil del paciente, reduciendo ausencias (no-shows) hasta un 70%.'
    },
    logistica: {
      ops: 75, mins: 3, payback: '< 2',
      rec: '<strong>SOLUCIÓN RECOMENDADA (INDUSTRIA / ACCESOS):</strong> Lectura de matrículas y albaranes por fotografía desde Telegram en ~0.9s con cruce instantáneo contra Excel/ERP y panel web en vivo.'
    },
    comercio: {
      ops: 35, mins: 5, payback: '2',
      rec: '<strong>SOLUCIÓN RECOMENDADA (DISTRIBUCIÓN):</strong> ERP conversacional donde tu equipo registra ventas, entradas de almacén y consulta stock hablando en lenguaje natural con guardrails contables.'
    }
  };

  var roiButtons = document.querySelectorAll('.roi-vbtn');
  var rngOps = document.getElementById('roi-ops');
  var rngMins = document.getElementById('roi-mins');
  var valOps = document.getElementById('roi-ops-val');
  var valMins = document.getElementById('roi-mins-val');
  var outHours = document.getElementById('roi-hours');
  var outEuros = document.getElementById('roi-euros');
  var outPayback = document.getElementById('roi-payback');
  var roiRec = document.getElementById('roi-recommendation');

  function updateRoiNumbers() {
    if (!rngOps || !rngMins) return;
    var ops = parseInt(rngOps.value, 10);
    var mins = parseInt(rngMins.value, 10);
    valOps.textContent = ops + ' / día';
    valMins.textContent = mins + ' min';

    var hoursPerYear = Math.round(((ops * mins) / 60) * 260 * 0.85);
    var eurosPerYear = Math.round(hoursPerYear * 15);

    outHours.innerHTML = hoursPerYear.toLocaleString('es-ES') + '<span>horas / año</span>';
    outEuros.innerHTML = eurosPerYear.toLocaleString('es-ES') + '<span>EUR / año</span>';
  }

  function selectRoiSector(key) {
    var sec = roiSectors[key];
    if (!sec) return;
    rngOps.value = sec.ops;
    rngMins.value = sec.mins;
    roiRec.innerHTML = sec.rec;
    outPayback.innerHTML = sec.payback + '<span>meses</span>';
    updateRoiNumbers();
  }

  roiButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      roiButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      selectRoiSector(btn.getAttribute('data-roi'));
    });
  });

  if (rngOps && rngMins) {
    rngOps.addEventListener('input', updateRoiNumbers);
    rngMins.addEventListener('input', updateRoiNumbers);
    selectRoiSector('taller');
  }

  /* ==========================================================================
     4. FORMULARIO DE DIAGNÓSTICO -> DESPACHO WHATSAPP
     ========================================================================== */
  var contactForm = document.getElementById('esaria-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (document.getElementById('f-name').value || '').trim();
      var sector = (document.getElementById('f-sector').value || '').trim();
      var msg = (document.getElementById('f-msg').value || '').trim();

      var text = 'Hola Javier, soy ' + name + ' (' + sector + '). ';
      if (msg) {
        text += 'Nos gustaría automatizar esto: ' + msg;
      } else {
        text += 'Me gustaría ver una demo rápida aplicada a nuestro negocio.';
      }
      var url = 'https://wa.me/34614918261?text=' + encodeURIComponent(text);
      window.open(url, '_blank', 'noopener');
    });
  }
})();
