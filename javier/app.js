(function () {
  'use strict';

  var scenarios = {
    parking: {
      label: 'ENTRADA DEL VIGILANTE (FOTO OCR / VOZ / TEXTO EN TELEGRAM)',
      engine: 'Motor: Qwen-VL-Flash + Regex ES',
      presets: [
        {
          title: '📸 Foto: "4821-MNP" (Autorizado)',
          input: '[Foto Cámara Móvil] Texto detectado en parachoques: E 4821 - MNP',
          output: function () {
            return (
              '🟢 ¡VEHÍCULO AUTORIZADO! (Latencia OCR: 0.89s)\n' +
              '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
              '• Raw OCR (Qwen-VL):   "E 4821 - MNP"\n' +
              '• Matrícula Normalizada: "4821MNP" (Formato Moderno ES)\n' +
              '• Entidad / Caseta:      Caseta Regional de León (Proveedor)\n' +
              '• Titular / Pase:        Logística y Suministros Norte S.L.\n' +
              '• Observaciones:         Acceso permitido carga/descarga\n' +
              '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
              'Acción ejecutada: Botón inline [✅ REGISTRAR ENTRADA] enviado a Telegram y sincronizado con panel web.'
            );
          }
        },
        {
          title: '🎙️ Voz: "VA 9213 AL" (Provincial)',
          input: 'Nota de voz transcrita (faster-whisper): "Comprueba furgoneta matrícula Valladolid nueve dos uno tres A L"',
          output: function () {
            return (
              '🟢 ¡VEHÍCULO AUTORIZADO! (Latencia Búsqueda: 0.14s)\n' +
              '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
              '• Entrada de Voz:        "VA 9213 AL"\n' +
              '• Matrícula Normalizada: "VA9213AL" (Formato Provincial ES)\n' +
              '• Entidad / Caseta:      Organización / Mantenimiento\n' +
              '• Estado en Recinto:     ENTRADA REGISTRADA (18:24h)\n' +
              '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
              'Acción ejecutada: Registro añadido en registros.csv + contador /coches_hoy actualizado.'
            );
          }
        },
        {
          title: '🔴 Foto: "9901-ZZZ" (No autorizado)',
          input: '[Foto Cámara Móvil] Matrícula detectada: 9901 ZZZ',
          output: function () {
            return (
              '🔴 ACCESO DENEGADO / NO AUTORIZADO (0.82s)\n' +
              '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
              '• Matrícula consultada:  "9901ZZZ"\n' +
              '• Motivo:                No figura en matriculas_findesemana.xlsx\n' +
              '• Sugerencia Fuzzy:      ¿Quisiste decir "9907ZZB" (Caseta Ávila)?\n' +
              '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
              'Acción ejecutada: Alerta visual en Telegram al operario de puerta.'
            );
          }
        }
      ]
    },
    erp: {
      label: 'MENSAJE NATURAL EN EL GRUPO DE SOCIOS (TELEGRAM)',
      engine: 'Motor: DeepSeek V4 Flash + FastAPI Tools',
      presets: [
        {
          title: '💸 Venta rápida: "Vendidos 3 de sandía a Marcos"',
          input: 'Oye, le acabo de vender 3 de sandía a Marcos, apúntalo.',
          output: function () {
            return (
              '{\n' +
              '  "accion": "registrar_venta",\n' +
              '  "params": {\n' +
              '    "producto_id": 4,\n' +
              '    "sabor_resuelto": "Sandía Ice 20mg",\n' +
              '    "cantidad": 3,\n' +
              '    "persona": "Marcos",\n' +
              '    "precio_unitario": null\n' +
              '  },\n' +
              '  "validacion_reglas": "OK -> Se aplica precio_venta oficial de SQLite (10.00 €/ud)",\n' +
              '  "impacto_db": "Stock ID#4: 18 -> 15 uds | Ingreso: +30.00 € | Beneficio neto: +16.50 €",\n' +
              '  "respuesta_telegram": "✅ Venta registrada: 3x Sandía a Marcos (+30€). Quedan 15 en stock."\n' +
              '}'
            );
          }
        },
        {
          title: '📦 Entrada de lote nuevo (crear_y_comprar)',
          input: 'He comprado al proveedor 25 unidades de un sabor nuevo: Mango Loco a 4,50€ de coste y los venderemos a 10€.',
          output: function () {
            return (
              '{\n' +
              '  "accion": "crear_y_comprar",\n' +
              '  "params": {\n' +
              '    "sabor": "Mango Loco",\n' +
              '    "cantidad": 25,\n' +
              '    "precio_compra": 4.5,\n' +
              '    "precio_venta": 10.0\n' +
              '  },\n' +
              '  "impacto_db": "Nuevo producto ID#19 creado + Transacción de compra (-112.50 €) registrada",\n' +
              '  "respuesta_telegram": "📦 Creado \'Mango Loco\' y añadidos 25 al inventario (Coste lote: 112,50€)."\n' +
              '}'
            );
          }
        },
        {
          title: '🛡️ Guardrail: Cantidad ambigua',
          input: 'Apunta que he vendido unos cuantos de arándanos hoy.',
          output: function () {
            return (
              '{\n' +
              '  "accion": "responder",\n' +
              '  "guardrail_activado": "REGLA_3_CANTIDAD_AMBIGUA",\n' +
              '  "params": {\n' +
              '    "texto": "¿Cuántas unidades exactas de Arándanos has vendido y a qué precio o cliente? No modifico la base de datos hasta confirmar el número."\n' +
              '  },\n' +
              '  "impacto_db": "0 escrituras (Prevención de corrupción contable)"\n' +
              '}'
            );
          }
        }
      ]
    },
    taller: {
      label: 'MENSAJE DESORDENADO DEL CLIENTE POR WHATSAPP',
      engine: 'Motor: EsarIA Taller Triage + JSON',
      presets: [
        {
          title: '🚨 Caso Frenos: "Suena chirrido metálico"',
          input: 'Buenas, mira que al frenar fuerte noto el pedal raro y suena como un chirrido metálico en la rueda de delante, ¿me lo podéis mirar?',
          output: function () {
            return (
              '📋 FICHA PREVIA DE TALLER GENERADA AUTOMÁTICAMENTE\n' +
              '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
              '• Categoría detectada:   Frenos y Seguridad Vial\n' +
              '• Prioridad asignada:    🔴 ALTA (Riesgo mecánico / seguridad)\n' +
              '• Síntoma estructurado:  Tacto anómalo en pedal + fricción metálica en frenada fuerte\n' +
              '• Datos faltantes:       [Marca/Modelo, Año, Kilometraje, Testigo ABS/Freno]\n' +
              '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
              '💬 Respuesta automática enviada al cliente por WhatsApp:\n' +
              '"Hola, por lo que describes de los frenos le damos prioridad. Para dejarte hueco hoy mismo dime por favor: 1) Qué coche y modelo es, y 2) Si se enciende algún testigo en el cuadro."'
            );
          }
        },
        {
          title: '🌡️ Caso Temperatura: "Gotas y calentón en ciudad"',
          input: 'Hola buenas, ayer vi unas gotas debajo del coche al aparcar y hoy andando por Valladolid en ciudad la aguja de la temperatura sube bastante.',
          output: function () {
            return (
              '📋 FICHA PREVIA DE TALLER GENERADA AUTOMÁTICAMENTE\n' +
              '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
              '• Categoría detectada:   Temperatura, Refrigeración y Fluidos\n' +
              '• Prioridad asignada:    🔴 ALTA (Riesgo de culata / sobrecalentamiento)\n' +
              '• Condición de fallo:    Tráfico urbano + pérdida previa de líquido\n' +
              '• Acción sugerida:       Revisar circuito de refrigeración, bomba/termostato y fugas\n' +
              '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
              '💬 Respuesta automática enviada al cliente por WhatsApp:\n' +
              '"Recibido. Ojo con seguir circulando si sube la aguja para no dañar el motor. Indícame matrícula o modelo del coche y te confirmamos hora de recepción urgente."'
            );
          }
        }
      ]
    }
  };

  var currentTab = 'parking';
  var currentPresetIndex = 0;

  var tabs = document.querySelectorAll('.sim-tab');
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
      return { plate: mod[1] + mod[2], type: 'Formato Europeo Moderno (NNNN-LLL)' };
    }
    var prv = upper.match(/([A-Z]{1,2})\s*[- ]?\s*([0-9]{4})\s*[- ]?\s*([A-Z]{1,2})/);
    if (prv) {
      return { plate: prv[1] + prv[2] + prv[3], type: 'Formato Provincial Español' };
    }
    return null;
  }

  function evaluateCustomInput(mode, text) {
    var clean = (text || '').trim();
    if (!clean) {
      return 'Introduce un texto de prueba o selecciona uno de los casos reales de arriba.';
    }

    // Check if matches active preset exactly
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
          '🟢 MATRÍCULA DETECTADA Y NORMALIZADA (0.21s)\n' +
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
          '• Entrada original:      "' + clean + '"\n' +
          '• Matrícula limpia:      "' + res.plate + '"\n' +
          '• Patrón reconocido:     ' + res.type + '\n' +
          '• Consulta en DB:        Verificada contra listado matriculas.csv\n' +
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
          'Listo para registrar entrada en el recinto desde Telegram.'
        );
      }
      return (
        '⚠️ SIN PATRÓN DE MATRÍCULA ESPAÑOLA CLARO\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
        '• Entrada recibida: "' + clean + '"\n' +
        '• Sugerencia: Prueba a incluir una matrícula como "4821-MNP" o "VA-1234-AB".'
      );
    }

    if (mode === 'erp') {
      var numMatch = clean.match(/\b(\d+)\b/);
      var qty = numMatch ? parseInt(numMatch[1], 10) : null;
      if (!qty) {
        return (
          '{\n' +
          '  "accion": "responder",\n' +
          '  "guardrail": "CANTIDAD_NO_ESPECIFICADA",\n' +
          '  "mensaje": "He entendido tu mensaje (\'' + clean + '\'), pero necesito la cantidad exacta de unidades para ejecutar el asiento en SQLite."\n' +
          '}'
        );
      }
      return (
        '{\n' +
        '  "accion": "registrar_transaccion",\n' +
        '  "params": {\n' +
        '    "mensaje_original": "' + clean.replace(/"/g, '\\"') + '",\n' +
        '    "cantidad_detectada": ' + qty + ',\n' +
        '    "validacion_sqlite": "OK"\n' +
        '  },\n' +
        '  "respuesta_telegram": "✅ Operación procesada por el agente para ' + qty + ' unidades y sincronizada con el Dashboard."\n' +
        '}'
      );
    }

    return (
      '📋 FICHA PREVIA DE TALLER GENERADA\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      '• Mensaje del cliente:   "' + clean + '"\n' +
      '• Clasificación IA:      Incidencia mecánica recibida por canal digital\n' +
      '• Datos por solicitar:   Marca/modelo, matrícula y disponibilidad horaria\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      'El bot responde automáticamente pidiendo los datos faltantes antes de pasar aviso al jefe de taller.'
    );
  }

  function runSimulation() {
    latencyBadge.textContent = 'Procesando...';
    var start = performance.now();
    setTimeout(function () {
      var result = evaluateCustomInput(currentTab, inputArea.value);
      outputArea.textContent = result;
      var elapsed = Math.max(12, Math.round(performance.now() - start));
      latencyBadge.textContent = '✓ Ejecutado (' + elapsed + ' ms en cliente)';
    }, 120);
  }

  function renderScenario(tabKey) {
    currentTab = tabKey;
    currentPresetIndex = 0;
    var scen = scenarios[tabKey];
    if (!scen) return;

    inputLabel.textContent = scen.label;
    engineBadge.textContent = scen.engine;
    presetsContainer.innerHTML = '';

    scen.presets.forEach(function (preset, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'preset-chip';
      btn.textContent = preset.title;
      btn.addEventListener('click', function () {
        currentPresetIndex = idx;
        inputArea.value = preset.input;
        runSimulation();
      });
      presetsContainer.appendChild(btn);
    });

    inputArea.value = scen.presets[0].input;
    outputArea.textContent = scen.presets[0].output();
    latencyBadge.textContent = '✓ Pipeline activo';
  }

  tabs.forEach(function (tabBtn) {
    tabBtn.addEventListener('click', function () {
      tabs.forEach(function (b) { b.classList.remove('active'); });
      tabBtn.classList.add('active');
      var target = tabBtn.getAttribute('data-sim');
      renderScenario(target);
    });
  });

  if (runBtn) {
    runBtn.addEventListener('click', runSimulation);
  }

  renderScenario('parking');
})();
