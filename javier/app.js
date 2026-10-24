(function () {
  'use strict';

  var scenarios = {
    parking: {
      label: 'ENTRADA DE CAMPO (TELEGRAM // CÁMARA O VOZ)',
      engine: 'MOTOR: QWEN-VL-FLASH + REGEX ES',
      presets: [
        {
          title: 'CASO 01: FOTO "4821-MNP" [AUTORIZADO]',
          input: '[IMAGE_STREAM_B64] Parachoques delantero detectado: "E 4821 - MNP"',
          output: function () {
            return (
              '[STATUS: 200 OK // LATENCIA TOTAL: 890ms]\n' +
              '────────────────────────────────────────────────────────\n' +
              '01. OCR_PROVIDER     : OpenCode Go (Qwen-VL-Flash)\n' +
              '02. RAW_STRING       : "E 4821 - MNP"\n' +
              '03. REGEX_NORMALIZED : "4821MNP" [PATRÓN: EUROPEO_MODERNO]\n' +
              '04. DB_LOOKUP        : MATCH ENCONTRADO EN matriculas.csv\n' +
              '    ├─ ENTIDAD       : Caseta Regional de León (Proveedor)\n' +
              '    ├─ TITULAR       : Logística y Suministros Norte S.L.\n' +
              '    └─ OBSERVACIONES : Acceso carga/descarga autorizado\n' +
              '05. DISPATCH         : Callback [ENTRA] enviado a Telegram + Sync Web.'
            );
          }
        },
        {
          title: 'CASO 02: VOZ "VA 9213 AL" [PROVINCIAL]',
          input: '[VOICE_STT_WHISPER] "Comprueba furgoneta matrícula Valladolid nueve dos uno tres A L"',
          output: function () {
            return (
              '[STATUS: 200 OK // LATENCIA BÚSQUEDA: 140ms]\n' +
              '────────────────────────────────────────────────────────\n' +
              '01. STT_ENGINE       : faster-whisper local (base, int8)\n' +
              '02. REGEX_NORMALIZED : "VA9213AL" [PATRÓN: PROVINCIAL_ES]\n' +
              '03. DB_LOOKUP        : MATCH ENCONTRADO EN matriculas.csv\n' +
              '    ├─ ENTIDAD       : Organización / Mantenimiento Recinto\n' +
              '    └─ ESTADO        : ENTRADA REGISTRADA (18:45:12 CET)\n' +
              '04. AUDIT_LOG        : Fila añadida en registros.csv (/coches_hoy +1).'
            );
          }
        },
        {
          title: 'CASO 03: FOTO "9901-ZZZ" [DENEGADO + FUZZY]',
          input: '[IMAGE_STREAM_B64] Matrícula capturada en acceso nocturno: "9901 ZZZ"',
          output: function () {
            return (
              '[STATUS: 403 FORBIDDEN // ACCESO DENEGADO // 820ms]\n' +
              '────────────────────────────────────────────────────────\n' +
              '01. REGEX_NORMALIZED : "9901ZZZ"\n' +
              '02. DB_LOOKUP        : 0 COINCIDENCIAS EXACTAS\n' +
              '03. FUZZY_MATCHER    : Distancia Levenshtein <= 1 activada\n' +
              '    └─ SUGERENCIA    : ¿Posible lectura errónea de "9907ZZB" (Caseta Ávila)?\n' +
              '04. DISPATCH         : Alerta de bloqueo enviada al vigilante en puerta.'
            );
          }
        }
      ]
    },
    erp: {
      label: 'MENSAJE NATURAL EN GRUPO OPERATIVO (TELEGRAM)',
      engine: 'MOTOR: DEEPSEEK V4 FLASH + FASTAPI TOOLS',
      presets: [
        {
          title: 'CASO 01: VENTA NATURAL (PRECIO IMPLÍCITO)',
          input: 'Oye, le acabo de vender 3 de sandía a Marcos, apúntalo.',
          output: function () {
            return (
              '{\n' +
              '  "tool_call": "registrar_venta",\n' +
              '  "params": {\n' +
              '    "producto_id": 4,\n' +
              '    "sabor_resuelto": "Sandía Ice",\n' +
              '    "cantidad": 3,\n' +
              '    "persona": "Marcos",\n' +
              '    "precio_unitario": null\n' +
              '  },\n' +
              '  "guardrail_check": "PASS -> precio_unitario=null delega en PVP oficial SQLite (10.00 EUR)",\n' +
              '  "sqlite_tx": "UPDATE productos SET stock = 15 WHERE id = 4; INSERT INTO transacciones (+30.00 EUR)",\n' +
              '  "net_margin": "+16.50 EUR"\n' +
              '}'
            );
          }
        },
        {
          title: 'CASO 02: ALTA Y COMPRA ATÓMICA (LOTE NUEVO)',
          input: 'He comprado al proveedor 25 unidades de un sabor nuevo: Mango a 4,50€ de coste y PVP 10€.',
          output: function () {
            return (
              '{\n' +
              '  "tool_call": "crear_y_comprar",\n' +
              '  "params": {\n' +
              '    "sabor": "Mango",\n' +
              '    "cantidad": 25,\n' +
              '    "precio_compra": 4.5,\n' +
              '    "precio_venta": 10.0\n' +
              '  },\n' +
              '  "sqlite_tx": "INSERT producto ID#19 + INSERT compra (-112.50 EUR)",\n' +
              '  "dashboard_sync": "Chart.js actualizado vía FastAPI /api/stats"\n' +
              '}'
            );
          }
        },
        {
          title: 'CASO 03: GUARDRAIL CANTIDAD AMBIGUA',
          input: 'Apunta que he vendido unos cuantos de arándanos esta tarde.',
          output: function () {
            return (
              '{\n' +
              '  "tool_call": "responder",\n' +
              '  "guardrail_triggered": "RULE_03_AMBIGUOUS_QUANTITY",\n' +
              '  "db_writes": 0,\n' +
              '  "agent_reply": "Bloqueo preventivo: necesito el número exacto de unidades de Arándanos vendidas antes de modificar la contabilidad en SQLite."\n' +
              '}'
            );
          }
        }
      ]
    },
    actas: {
      label: 'FOTOGRAFÍA DE ACTA ARBITRAL MANUSCRITA (TELEGRAM)',
      engine: 'MOTOR: VISIÓN MULTIMODAL + MYSQUAD AUTOMATION',
      presets: [
        {
          title: 'CASO 01: ACTA OFICIAL BALONMANO (TRAMITACIÓN COMPLETA)',
          input: '[PHOTO_UPLOAD] Acta manuscrita Partido #FBM-2026-084: BM Valladolid 28 - 26 Ademar (2 exclusiones, 0 descalificaciones).',
          output: function () {
            return (
              '[PIPELINE: ACTAS_BALONMANO.PY // MODO: AUTÓNOMO]\n' +
              '────────────────────────────────────────────────────────\n' +
              '01. VISION_EXTRACT   : Lectura de marcador, dorsales y sanciones completada\n' +
              '02. JSON_VALIDATION  : Suma de goles por tiempo verificada (28 vs 26)\n' +
              '03. MYSQUAD_SESSION  : Login federativo OK -> Volcado de formulario web\n' +
              '04. OFFICIAL_PDF     : Descargado "acta_oficial_firmada_084.pdf" (142 KB)\n' +
              '05. TELEGRAM_RETURN  : PDF oficial remitido al árbitro en 14.2 segundos.'
            );
          }
        }
      ]
    },
    taller: {
      label: 'MENSAJE DESORDENADO DE CLIENTE (WHATSAPP CLOUD API)',
      engine: 'MOTOR: ESARIA TALLER TRIAGE + JSON SCHEMA',
      presets: [
        {
          title: 'CASO 01: FRENOS Y SEGURIDAD VIAL [PRIORIDAD ALTA]',
          input: 'Buenas, mira que al frenar fuerte noto el pedal raro y suena como un chirrido metálico en la rueda de delante, ¿me lo podéis mirar?',
          output: function () {
            return (
              '[ORDEN PREVIA DE RECEPCIÓN // CASO #2026-F01]\n' +
              '────────────────────────────────────────────────────────\n' +
              '• CATEGORÍA          : Frenos y Seguridad Activa\n' +
              '• PRIORIDAD          : ALTA [Valorar inmovilización preventiva]\n' +
              '• SÍNTOMA EXTRAÍDO   : Anomalía táctil en pedal + fricción metálica\n' +
              '• CAMPOS FALTANTES   : [Marca/Modelo, Año, Testigo cuadro, Frío/Caliente]\n' +
              '────────────────────────────────────────────────────────\n' +
              '• RESPUESTA AUTOMÁTICA WHATSAPP:\n' +
              '  "Recibido. Al ser tema de frenos le damos prioridad. Para abrirte ficha antes de que llegues dime: 1) Marca, modelo y año del coche, y 2) Si se enciende algún testigo en el cuadro."'
            );
          }
        },
        {
          title: 'CASO 02: FUGA Y TEMPERATURA EN CIUDAD',
          input: 'Ayer vi unas gotas debajo del coche y hoy andando por Valladolid en ciudad la temperatura sube bastante.',
          output: function () {
            return (
              '[ORDEN PREVIA DE RECEPCIÓN // CASO #2026-T02]\n' +
              '────────────────────────────────────────────────────────\n' +
              '• CATEGORÍA          : Temperatura, Refrigeración y Fluidos\n' +
              '• PRIORIDAD          : ALTA [Riesgo de sobrecalentamiento de culata]\n' +
              '• CONDICIÓN          : Tráfico urbano + pérdida previa de refrigerante\n' +
              '• CAMPOS FALTANTES   : [Marca/Modelo, Matrícula, Testigo temperatura]\n' +
              '────────────────────────────────────────────────────────\n' +
              '• ACCIÓN SUGERIDA AL JEFE DE TALLER:\n' +
              '  Revisar nivel de vaso de expansión, estanqueidad de manguitos, termostato y electroventilador.'
            );
          }
        }
      ]
    }
  };

  var currentTab = 'parking';
  var tabs = document.querySelectorAll('.wb-tab');
  var inputLabel = document.getElementById('sim-input-label');
  var engineBadge = document.getElementById('sim-engine-badge');
  var presetsContainer = document.getElementById('sim-presets');
  var inputArea = document.getElementById('sim-input');
  var outputArea = document.getElementById('sim-output');
  var latencyBadge = document.getElementById('sim-latency');
  var runBtn = document.getElementById('sim-run-btn');

  function normalizeSpanishPlate(rawText) {
    var upper = (rawText || '').toUpperCase();
    var mod = upper.match(/([0-9]{4})\s*[- ]?\s*([BCDFGHJKLMNPRSTVWXYZ]{3})/);
    if (mod) {
      return { plate: mod[1] + mod[2], type: 'EUROPEO_MODERNO (NNNN-LLL)' };
    }
    var prv = upper.match(/([A-Z]{1,2})\s*[- ]?\s*([0-9]{4})\s*[- ]?\s*([A-Z]{1,2})/);
    if (prv) {
      return { plate: prv[1] + prv[2] + prv[3], type: 'PROVINCIAL_ES' };
    }
    return null;
  }

  function evaluateCustomInput(mode, text) {
    var clean = (text || '').trim();
    if (!clean) {
      return '[WARN] Introduce una entrada o selecciona un caso de prueba superior.';
    }

    var activeScen = scenarios[mode];
    for (var i = 0; i < activeScen.presets.length; i++) {
      if (activeScen.presets[i].input === clean) {
        return activeScen.presets[i].output();
      }
    }

    if (mode === 'parking') {
      var res = normalizeSpanishPlate(clean);
      if (res) {
        return (
          '[STATUS: 200 OK // INSPECCIÓN EN VIVO]\n' +
          '────────────────────────────────────────────────────────\n' +
          '01. RAW_INPUT        : "' + clean + '"\n' +
          '02. REGEX_NORMALIZED : "' + res.plate + '"\n' +
          '03. FORMAT_DETECTED  : ' + res.type + '\n' +
          '04. DB_QUERY         : SELECT * FROM matriculas WHERE plate = \'' + res.plate + '\''
        );
      }
      return (
        '[STATUS: 422 UNPROCESSABLE // SIN MATRÍCULA VÁLIDA]\n' +
        '────────────────────────────────────────────────────────\n' +
        '• Entrada analizada: "' + clean + '"\n' +
        '• Nota: Incluye una matrícula española (ej. 4821-MNP o VA-1234-AB).'
      );
    }

    if (mode === 'erp') {
      var numMatch = clean.match(/\b(\d+)\b/);
      var qty = numMatch ? parseInt(numMatch[1], 10) : null;
      if (!qty) {
        return (
          '{\n' +
          '  "tool_call": "responder",\n' +
          '  "guardrail_triggered": "MISSING_EXACT_QUANTITY",\n' +
          '  "db_writes": 0,\n' +
          '  "message": "Entrada recibida, pero se requiere cantidad numérica exacta para ejecutar asiento en SQLite."\n' +
          '}'
        );
      }
      return (
        '{\n' +
        '  "tool_call": "registrar_operacion",\n' +
        '  "params": {\n' +
        '    "raw_utterance": "' + clean.replace(/"/g, '\\"') + '",\n' +
        '    "cantidad_extraida": ' + qty + '\n' +
        '  },\n' +
        '  "sqlite_status": "COMMIT_READY"\n' +
        '}'
      );
    }

    return (
      '[PIPELINE TRACE // MODO: ' + mode.toUpperCase() + ']\n' +
      '────────────────────────────────────────────────────────\n' +
      '01. PAYLOAD_IN       : "' + clean + '"\n' +
      '02. SCHEMA_VALIDATED : TRUE\n' +
      '03. ACTION           : Ficha estructurada generada y lista para despacho.'
    );
  }

  function runSimulation() {
    latencyBadge.textContent = 'EJECUTANDO...';
    var t0 = performance.now();
    setTimeout(function () {
      outputArea.textContent = evaluateCustomInput(currentTab, inputArea.value);
      var dt = Math.max(8, Math.round(performance.now() - t0));
      latencyBadge.textContent = 'TRAZA OK // ' + dt + 'ms';
    }, 90);
  }

  function renderScenario(tabKey) {
    currentTab = tabKey;
    var scen = scenarios[tabKey];
    if (!scen) return;

    inputLabel.textContent = scen.label;
    engineBadge.textContent = scen.engine;
    presetsContainer.innerHTML = '';

    scen.presets.forEach(function (preset) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wb-chip';
      btn.textContent = preset.title;
      btn.addEventListener('click', function () {
        inputArea.value = preset.input;
        runSimulation();
      });
      presetsContainer.appendChild(btn);
    });

    inputArea.value = scen.presets[0].input;
    outputArea.textContent = scen.presets[0].output();
    latencyBadge.textContent = 'ESTADO: LISTO';
  }

  tabs.forEach(function (tabBtn) {
    tabBtn.addEventListener('click', function () {
      tabs.forEach(function (b) { b.classList.remove('active'); });
      tabBtn.classList.add('active');
      renderScenario(tabBtn.getAttribute('data-sim'));
    });
  });

  if (runBtn) {
    runBtn.addEventListener('click', runSimulation);
  }

  renderScenario('parking');
})();
