#!/usr/bin/env python3
"""
EsarIA — Generador de PDF de la Auditoría Go-To-Market
Genera un HTML con diseño corporativo premium y lo compila a PDF.
"""

import subprocess
import os
import sys
from pathlib import Path

BASE = Path(__file__).parent.parent.parent
HTML_PATH = BASE / "prospecting" / "pdf" / "auditoria-gtm-esaria.html"
PDF_PATH  = BASE / "prospecting" / "pdf" / "auditoria-gtm-esaria.pdf"
DOCS_PDF_PATH = BASE / "docs" / "comercial" / "auditoria-gtm-esaria.pdf"
ARTIFACT_PDF_PATH = Path("/Users/javidel/.gemini/antigravity-cli/brain/3331dd1f-91a4-4b09-98ce-9997d7fd448b/auditoria-gtm-esaria.pdf")

CHROME_CANDIDATES = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
]

HTML_CONTENT = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Auditoría Go-To-Market — EsarIA</title>
  <style>
    /* ─── Variables y Paleta Oficial EsarIA ─── */
    :root {
      --dark:      #0F172A;
      --accent:    #6D5EF3;
      --accent-light: #EEF2FF;
      --bg:        #F8FAFC;
      --text:      #1E293B;
      --subtle:    #64748B;
      --border:    #E2E8F0;
      --white:     #FFFFFF;
      --danger:    #EF4444;
      --danger-light: #FEF2F2;
      --warning:   #F59E0B;
      --warning-light: #FFFBEB;
      --success:   #10B981;
    }

    /* ─── Reset ─── */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      line-height: 1.6;
      color: var(--text);
      background: #CBD5E1;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ─── Botón Impresión Web ─── */
    .no-print {
      text-align: center;
      padding: 1rem;
      background: var(--bg);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .no-print button {
      background: var(--accent);
      color: var(--white);
      border: none;
      padding: 0.6rem 1.4rem;
      border-radius: 6px;
      font-size: 0.875rem;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s ease;
    }

    .no-print button:hover {
      background: #5B4EE0;
    }

    /* ─── Layout A4 ─── */
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 2rem auto;
      background: var(--white);
      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.15);
      padding: 20mm 22mm;
      position: relative;
      display: flex;
      flex-direction: column;
    }

    /* ─── Portada ─── */
    .page-cover {
      background: var(--dark);
      color: var(--white);
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 0 30mm;
    }

    .cover-logo {
      height: 50px;
      margin-bottom: 3rem;
    }

    .cover-title {
      font-size: 2.2rem;
      font-weight: 800;
      line-height: 1.25;
      letter-spacing: -0.03em;
      color: var(--white);
      margin-bottom: 1rem;
    }

    .cover-accent {
      color: var(--accent);
    }

    .cover-subtitle {
      font-size: 1rem;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--subtle);
      margin-bottom: 4rem;
    }

    .cover-meta {
      border-top: 1px solid #334155;
      padding-top: 1.5rem;
      width: 100%;
      max-width: 320px;
      font-size: 0.85rem;
      color: #94A3B8;
      text-align: left;
      line-height: 1.8;
      margin-top: 2rem;
    }

    .cover-meta strong {
      color: var(--white);
    }

    .cover-footer {
      position: absolute;
      bottom: 20mm;
      font-size: 0.75rem;
      color: #475569;
      letter-spacing: 0.05em;
    }

    /* ─── Cabecera y Pie de Página ─── */
    .header-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--subtle);
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .header-nav img {
      height: 16px;
    }

    .page-footer {
      position: absolute;
      bottom: 15mm;
      left: 22mm;
      right: 22mm;
      display: flex;
      justify-content: space-between;
      font-size: 0.7rem;
      color: var(--subtle);
      border-top: 1px solid var(--border);
      padding-top: 0.5rem;
    }

    /* ─── Contenido ─── */
    .content {
      flex: 1;
      padding-bottom: 15mm; /* Evitar que el texto pise el footer */
    }

    h1.page-title {
      font-size: 1.6rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--dark);
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    h1.page-title span {
      background: var(--accent);
      color: var(--white);
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    h2 {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--dark);
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
      letter-spacing: -0.01em;
    }

    h3 {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--dark);
      margin-top: 1rem;
      margin-bottom: 0.5rem;
    }

    p {
      margin-bottom: 0.85rem;
      color: var(--text);
    }

    strong {
      color: var(--dark);
    }

    ul, ol {
      margin-bottom: 1rem;
      padding-left: 1.2rem;
    }

    li {
      margin-bottom: 0.35rem;
    }

    /* ─── Tablas Premium ─── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.2rem 0;
      font-size: 0.8rem;
    }

    th {
      background: var(--dark);
      color: var(--white);
      font-weight: 600;
      text-align: left;
      padding: 0.6rem 0.8rem;
      text-transform: uppercase;
      font-size: 0.7rem;
      letter-spacing: 0.05em;
    }

    td {
      padding: 0.5rem 0.8rem;
      border-bottom: 1px solid var(--border);
      color: var(--text);
    }

    tr:nth-child(even) td {
      background: #F8FAFC;
    }

    /* ─── Bloques de Alerta y Enfoque ─── */
    .badge-error {
      background: var(--danger);
      color: var(--white);
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 3px;
      text-transform: uppercase;
      vertical-align: middle;
      margin-right: 6px;
    }

    .badge-warning {
      background: var(--warning);
      color: var(--white);
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 3px;
      text-transform: uppercase;
      vertical-align: middle;
      margin-right: 6px;
    }

    .badge-info {
      background: var(--accent);
      color: var(--white);
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 3px;
      text-transform: uppercase;
      vertical-align: middle;
      margin-right: 6px;
    }

    .alert-card {
      border-left: 4px solid var(--danger);
      background: var(--danger-light);
      padding: 1rem;
      border-radius: 0 8px 8px 0;
      margin: 1.2rem 0;
    }

    .alert-card h3 {
      color: #991B1B;
      margin-top: 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .alert-card p {
      color: #7F1D1D;
      margin-bottom: 0;
      font-size: 0.82rem;
    }

    .warning-card {
      border-left: 4px solid var(--warning);
      background: var(--warning-light);
      padding: 1rem;
      border-radius: 0 8px 8px 0;
      margin: 1.2rem 0;
    }

    .warning-card h3 {
      color: #92400E;
      margin-top: 0;
    }

    .warning-card p {
      color: #78350F;
      margin-bottom: 0;
      font-size: 0.82rem;
    }

    .info-card {
      border-left: 4px solid var(--accent);
      background: var(--accent-light);
      padding: 1rem;
      border-radius: 0 8px 8px 0;
      margin: 1.2rem 0;
    }

    .info-card h3 {
      color: #3730A3;
      margin-top: 0;
    }

    .info-card p {
      color: #312E81;
      margin-bottom: 0;
      font-size: 0.82rem;
    }

    .comparison-table td {
      vertical-align: top;
      width: 50%;
    }

    /* ─── Paginación Impresora ─── */
    @media print {
      body {
        background: var(--white);
      }
      .no-print {
        display: none !important;
      }
      .page {
        margin: 0 !important;
        box-shadow: none !important;
        page-break-after: always;
      }
      .page:last-child {
        page-break-after: avoid;
      }
    }
  </style>
</head>
<body>

  <div class="no-print">
    <button onclick="window.print()">Imprimir o Guardar como PDF</button>
    <p style="font-size: 0.75rem; color: var(--subtle); margin-top: 0.4rem;">Usa este botón para abrir la ventana de impresión y guardar como PDF en tu sistema.</p>
  </div>

  <!-- PÁGINA 1: PORTADA -->
  <div class="page page-cover">
    <img src="../../assets/brand/logo/esaria-logo-horizontal.svg" alt="EsarIA Logo" class="cover-logo" onerror="this.src='https://esaria.es/assets/brand/logo/esaria-logo-horizontal.svg'">
    <h1 class="cover-title">Auditoría de Procedimientos &<br>Estrategia <span class="cover-accent">Go-To-Market</span></h1>
    <p class="cover-subtitle">Consultoría de Negocio B2B</p>
    
    <div class="cover-meta">
      <strong>Preparado para:</strong> EsarIA — Javier Delgado Hernández<br>
      <strong>Ubicación:</strong> Valladolid, España<br>
      <strong>Fecha:</strong> Mayo de 2026<br>
      <strong>Estado:</strong> Borrador de Validación Técnica y Comercial
    </div>

    <hr style="border: none; border-top: 1px solid #334155; width: 100%; max-width: 320px; margin: 1.5rem 0;">
    <p style="font-size: 0.75rem; color: #94A3B8; max-width: 300px; font-style: italic;">
      "Automatización útil para negocios reales, minimizando la fricción tecnológica."
    </p>

    <div class="cover-footer">
      ESARIA © 2026 · VALLADOLID
    </div>
  </div>

  <!-- PÁGINA 2: RADIOGRAFÍA -->
  <div class="page">
    <div class="header-nav">
      <span>EsarIA — Auditoría GTM</span>
      <span>Mayo 2026</span>
    </div>
    
    <div class="content">
      <h1 class="page-title">Radiografía del Estado Actual</h1>
      <p>Tras analizar minuciosamente los documentos comerciales, guiones, la base de datos de 20 leads operativos del CRM, el export de ~60 leads en bruto de Google Places, la web oficial y el historial de tus 11 primeras llamadas en frío realizadas entre el 19 y 20 de mayo, hemos extraído la siguiente radiografía real del proyecto:</p>
      
      <table>
        <thead>
          <tr>
            <th>Métrica / Elemento</th>
            <th>Estado Real del Proyecto</th>
            <th>Impacto GTM</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Leads operativos (CRM)</strong></td>
            <td>20 leads (Valladolid) — Fisioterapia (8), Gimnasio (6), Dental (3), Taller (3)</td>
            <td><span style="color: var(--success); font-weight: 600;">Alto</span> (Muy enfocado)</td>
          </tr>
          <tr>
            <td><strong>Leads en bruto</strong></td>
            <td>~50-60 leads listos en <code>leads-reales.json</code></td>
            <td><span style="color: var(--success); font-weight: 600;">Medio</span> (Buena base inicial)</td>
          </tr>
          <tr>
            <td><strong>Llamadas realizadas</strong></td>
            <td>11 llamadas en frío documentadas (19-20 de mayo)</td>
            <td><span style="color: var(--accent); font-weight: 600;">Bajo</span> (Falta volumen comercial)</td>
          </tr>
          <tr>
            <td><strong>Diagnósticos agendados</strong></td>
            <td>0 diagnósticos confirmados</td>
            <td><span style="color: var(--danger); font-weight: 600;">Crítico</span> (Bloqueo en captación)</td>
          </tr>
          <tr>
            <td><strong>Decisor identificado</strong></td>
            <td>Identificado en solo 4 de 20 leads (~20%)</td>
            <td><span style="color: var(--danger); font-weight: 600;">Crítico</span> (Llamadas mueren en recepción)</td>
          </tr>
          <tr>
            <td><strong>Email del lead</strong></td>
            <td>0% en leads operativos (0 de 20)</td>
            <td><span style="color: var(--warning); font-weight: 600;">Medio</span> (Limita seguimiento multicanal)</td>
          </tr>
          <tr>
            <td><strong>Demo funcional</strong></td>
            <td>No hay evidencia técnica ni prototipo enseñable en un clic</td>
            <td><span style="color: var(--danger); font-weight: 600;">Crítico</span> (Venta abstracta / humo)</td>
          </tr>
          <tr>
            <td><strong>RGPD y Legal</strong></td>
            <td>Políticas web genéricas. Sin DPA ni análisis de datos de salud</td>
            <td><span style="color: var(--danger); font-weight: 600;">Crítico</span> (Alto riesgo de sanción)</td>
          </tr>
        </tbody>
      </table>

      <h2>Análisis de tus 11 primeras llamadas en frío</h2>
      <p>El CRM registra un patrón claro en los primeros intentos de contacto:</p>
      <ul>
        <li><strong>Dentalios:</strong> Descartada porque "ya tienen bot de llamada". Esto te hizo dudar del sector clínico.</li>
        <li><strong>Clínica Velva:</strong> Descartada porque "ya están automatizando con otra aplicación".</li>
        <li><strong>CROSSBOX Utopia:</strong> "Ocupada, llamar mañana". Contacto con filtro o personal no decisor.</li>
        <li><strong>Fisioterapia Sofía:</strong> "Se lo ha pasado a la jefa". Bloqueado en recepción sin agendar fecha.</li>
        <li><strong>EQUÓN:</strong> "El responsable no estaba". Llamada fallida por falta de horario o cita con decisor.</li>
      </ul>
      
      <div class="info-card">
        <h3>Diagnóstico del Pipeline Comercial</h3>
        <p><strong>El problema principal no es tu tecnología. Es tu embudo comercial inicial.</strong> El 80% de tus llamadas mueren en filtros de recepción o se pierden porque no identificas al decisor antes de marcar. Además, la falta de una demo visual e interactiva te obliga a vender un concepto abstracto en un mercado local tradicionalmente desconfiado.</p>
      </div>
    </div>

    <div class="page-footer">
      <span>EsarIA — Consultoría de Salida al Mercado</span>
      <span>Página 2 de 6</span>
    </div>
  </div>

  <!-- PÁGINA 3: CRÍTICA DIRECTA -->
  <div class="page">
    <div class="header-nav">
      <span>EsarIA — Auditoría GTM</span>
      <span>Mayo 2026</span>
    </div>
    
    <div class="content">
      <h1 class="page-title"><span class="badge-error">Crítica Directa</span>Los 3 fallos de procedimiento más peligrosos</h1>
      
      <div class="alert-card">
        <h3>1. RGPD: Tienes un agujero legal grave al atacar el sector clínico</h3>
        <p>Tu primer sector prioritario (Fisioterapia y Clínicas Dentales) maneja <strong>datos de salud</strong>, que están protegidos bajo la categoría especial del RGPD (Art. 9). Actualmente, tus procedimientos ignoran este hecho de forma crítica.</p>
      </div>
      
      <p><strong>Vulnerabilidades detectadas:</strong></p>
      <ul>
        <li><strong>Falta de Contrato de Encargado del Tratamiento (DPA):</strong> Al automatizar citas de pacientes, accedes y tratas datos sensibles en nombre de la clínica. Sin un DPA firmado (Art. 28 RGPD), la clínica y tú estáis cometiendo una infracción grave sancionable por la AEPD.</li>
        <li><strong>Falta de Registro de Actividades de Tratamiento (RAT):</strong> Debes detallar qué datos tratas, para qué, y bajo qué medidas de seguridad.</li>
        <li><strong>Tránsito internacional de datos sin control:</strong> Si usas herramientas en la nube como Make, n8n cloud, OpenAI o APIs de mensajería cuyos servidores están fuera de la Unión Europea (como en EE.UU.), estás realizando una transferencia internacional de datos de salud sin las garantías contractuales obligatorias (cláusulas tipo).</li>
      </ul>

      <div class="alert-card" style="border-left-color: var(--warning); background: var(--warning-light);">
        <h3 style="color: #92400E;">2. Estás vendiendo jerga técnica ("Automatización") en vez de "Horas Libres"</h3>
        <p>El dueño de una PYME en Valladolid tiene un perfil tradicional. Conceptos como "automatizar procesos", "IA" o "flujos automáticos" generan miedo a perder el control del negocio, sospechas de coste elevado o sensación de complejidad técnica.</p>
      </div>
      
      <table class="comparison-table">
        <thead>
          <tr>
            <th style="background: #991B1B;">Tu Pitch Actual (Asusta al cliente)</th>
            <th style="background: #065F46;">El Pitch Comercial (Genera Cierre)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>"Ayudamos a tu negocio a ahorrar tiempo <strong>automatizando tareas repetitivas</strong> como confirmación de citas."</td>
            <td>"Hacemos que tus pacientes <strong>reserven solos y se les recuerde la cita</strong> por WhatsApp, para que tu recepcionista no pase una hora al día al teléfono."</td>
          </tr>
          <tr>
            <td>"Trabajamos con clínicas y talleres para <strong>automatizar respuestas e integraciones con IA</strong>."</td>
            <td>"Cuando tus clientes pregunten por WhatsApp vuestro horario o precios, <strong>el chat les responderá al instante</strong>, sin que tú tengas que dejar de trabajar."</td>
          </tr>
        </tbody>
      </table>

      <div class="alert-card">
        <h3>3. Falta de una demo visual interactiva para tu primera reunión</h3>
        <p>En el tejido empresarial de Castilla y León, el boca a boca y la confianza visual son claves. Si vas a un diagnóstico solo con un guion escrito, el cliente sentirá que le vendes humo. Necesitan <strong>tocar y ver</strong> cómo el sistema funciona en un entorno seguro antes de firmar nada.</p>
      </div>
    </div>

    <div class="page-footer">
      <span>EsarIA — Consultoría de Salida al Mercado</span>
      <span>Página 3 de 6</span>
    </div>
  </div>

  <!-- PÁGINA 4: ALERTAS DE CLIENTE -->
  <div class="page">
    <div class="header-nav">
      <span>EsarIA — Auditoría GTM</span>
      <span>Mayo 2026</span>
    </div>
    
    <div class="content">
      <h1 class="page-title"><span class="badge-warning">Alertas de Cliente</span>¿Qué puede salir mal y cómo blindarlo?</h1>
      <p>El primer cliente es el más peligroso. Tu deseo de agradar para asegurar un caso de éxito suele provocar decisiones operativas que destrozan tu rentabilidad y generan problemas legales. Debes blindar tu onboarding inmediatamente:</p>

      <div class="warning-card">
        <h3>Alerta 1: El fantasma del Scope Creep (Desviación del Alcance)</h3>
        <p>Tu <strong>Propuesta Base</strong> tiene la sección de "Lo que no incluye" prácticamente vacía o con placeholders. Esto es una invitación para que el cliente te exija cambios ilimitados. Al no haber límites firmados, terminarás haciendo 60 horas de trabajo extra cobrando 450€.</p>
        <p style="margin-top: 0.5rem; font-size: 0.8rem; font-weight: 600; color: #78350F;">
          👉 Solución: Define por contrato un máximo de 2 rondas de revisiones incluidas durante las 2 semanas de puesta en marcha. Cualquier petición posterior se presupuesta como "fase 2" a precio cerrado de 50€/hora.
        </p>
      </div>

      <div class="warning-card">
        <h3>Alerta 2: Pricing inviable en fase de aprendizaje</h3>
        <p>Tus precios base de 300€ - 600€ por una automatización simple son suicidas si no controlas los tiempos de implementación técnica. Tu primer proyecto te llevará el triple de tiempo del estimado debido a problemas imprevistos con APIs, permisos del cliente o ajustes de diseño.</p>
        <p style="margin-top: 0.5rem; font-size: 0.8rem; font-weight: 600; color: #78350F;">
          👉 Solución: No cobres menos de 500€ de implantación para el primer cliente. No ofrezcas "proyectos completos" multitarea. Vende UN solo proceso concreto (ej. recordatorios de cita por WhatsApp), ejecútalo a la perfección en una semana, y luego véndele la ampliación.
        </p>
      </div>

      <div class="warning-card">
        <h3>Alerta 3: Inexistencia de un Contrato de Prestación de Servicios</h3>
        <p>Una "propuesta aceptada" no es suficiente protección legal para ti. Necesitas un contrato que limite tu responsabilidad si el sistema de citas falla, que proteja la confidencialidad de los datos a los que accedes y que regule la propiedad intelectual de los flujos de Make/n8n.</p>
        <p style="margin-top: 0.5rem; font-size: 0.8rem; font-weight: 600; color: #78350F;">
          👉 Solución: Firma un acuerdo simple de 2 páginas con cláusula de limitación de daños (máximo reembolsable igual a lo pagado por el proyecto) para evitar demandas si ocurre un fallo en una API ajena.
        </p>
      </div>

      <div class="warning-card">
        <h3>Alerta 4: Muertes comerciales en recepción</h3>
        <p>Tus notas de llamadas muestran que hablas con secretarias o auxiliares. Ellas no tienen poder para comprar y su labor es filtrar llamadas pesadas. Tu objetivo comercial número uno en la primera llamada no es agendar un diagnóstico con la recepcionista, sino conseguir el nombre del gerente o dueño y hablar con él.</p>
        <p style="margin-top: 0.5rem; font-size: 0.8rem; font-weight: 600; color: #78350F;">
          👉 Solución: Antes de llamar, busca en la web ("Sobre nosotros") o LinkedIn el nombre del director. Si no aparece, pregunta en llamada: <em>"Hola, necesito enviar una propuesta de mejora de procesos organizativos al director de la clínica, ¿me podéis indicar su nombre completo?"</em>. Llama al día siguiente pidiendo hablar directamente con él/ella.
        </p>
      </div>
    </div>

    <div class="page-footer">
      <span>EsarIA — Consultoría de Salida al Mercado</span>
      <span>Página 4 de 6</span>
    </div>
  </div>

  <!-- PÁGINA 5: SUGERENCIAS DE VALOR -->
  <div class="page">
    <div class="header-nav">
      <span>EsarIA — Auditoría GTM</span>
      <span>Mayo 2026</span>
    </div>
    
    <div class="content">
      <h1 class="page-title"><span class="badge-info">Sugerencias tácticas</span>3 Palancas comerciales para Castilla y León</h1>
      <p>Valladolid y Castilla y León funcionan bajo dinámicas de confianza personal, redes institucionales y recomendaciones cruzadas. Las llamadas en frío puras tienen baja efectividad. Implementa estas tres tácticas para acelerar tu primer cierre comercial:</p>

      <div class="info-card" style="margin-bottom: 1.5rem;">
        <h3>Táctica 1: La Palanca Institucional (Colegios Profesionales)</h3>
        <p>En lugar de llamar a 50 fisioterapeutas o dentistas de forma individual en frío, contacta con el <strong>Colegio de Fisioterapeutas de Castilla y León (CPFCYL)</strong> o el Colegio de Dentistas de Valladolid.</p>
        <p style="margin-top: 0.5rem;">
          <strong>Acción concreta:</strong> Ofrece impartir un webinar o charla presencial gratuita de 30 minutos titulada <em>"Gestión de agenda y reducción de cancelaciones en clínicas de fisioterapia"</em>. No les hables de código ni de IA; enséñales datos de cuánto tiempo pierden al teléfono y cómo se puede solucionar de forma visual. Usa la marca del Colegio para obtener credibilidad inmediata. Al final de la charla, ofrece 5 diagnósticos gratuitos para los asistentes.
        </p>
      </div>

      <div class="info-card" style="margin-bottom: 1.5rem;">
        <h3>Táctica 2: Alianza Estratégica con Gestorías Locales</h3>
        <p>Las gestorías y asesorías fiscales de Valladolid son el "confidente" de confianza de las PYMEs locales. Ellos ya tienen la base de clientes y la confianza que a ti te falta construir.</p>
        <p style="margin-top: 0.5rem;">
          <strong>Acción concreta:</strong> Reúnete con 3-5 gestorías de Valladolid. Ofréceles un acuerdo de colaboración: por cada cliente que te recomienden y firme contigo, les das una comisión recurrente del 10% del proyecto o les optimizas un proceso interno de la gestoría de forma gratuita. Dales folletos sencillos o un one-pager que puedan enviar a sus clientes que se quejan de perder tiempo con tareas administrativas.
        </p>
      </div>

      <div class="info-card">
        <h3>Táctica 3: Piloto Gratuito Altamente Estratégico</h3>
        <p>Para romper el bloqueo del "primer cliente" (no tengo clientes porque no tengo casos de éxito, y viceversa), debes comprar credibilidad ofreciendo tu primer servicio gratis, pero bajo condiciones muy estrictas.</p>
        <p style="margin-top: 0.5rem;">
          <strong>Acción concreta:</strong> Elige un negocio local de Valladolid con el que ya tengas relación (tu propia clínica de fisio de confianza, el taller de un familiar o conocido). Ofréceles automatizar los recordatorios de cita de forma 100% gratuita durante 1 mes a cambio de:
        </p>
        <ul style="margin-top: 0.5rem; margin-bottom: 0.5rem;">
          <li>Un testimonio escrito detallando el tiempo ahorrado.</li>
          <li>Un video testimonio de 30 segundos del propietario recomendando a EsarIA.</li>
          <li>Una lista de 3 negocios amigos de la zona a los que te presentará personalmente.</li>
        </ul>
      </div>
    </div>

    <div class="page-footer">
      <span>EsarIA — Consultoría de Salida al Mercado</span>
      <span>Página 5 de 6</span>
    </div>
  </div>

  <!-- PÁGINA 6: PLAN DE ACCIÓN Y CONCLUSIÓN -->
  <div class="page">
    <div class="header-nav">
      <span>EsarIA — Auditoría GTM</span>
      <span>Mayo 2026</span>
    </div>
    
    <div class="content">
      <h1 class="page-title">Plan de Acción Inmediato</h1>
      <p>Para corregir los errores de procedimiento y acelerar la captación de forma segura, ejecuta los siguientes pasos priorizados por impacto y urgencia técnica:</p>
      
      <table>
        <thead>
          <tr>
            <th style="width: 10%;">Prioridad</th>
            <th style="width: 35%;">Acción Recomendada</th>
            <th style="width: 25%;">Responsable / Recurso</th>
            <th style="width: 30%;">Objetivo / Entregable</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span style="background: var(--danger); color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 0.65rem;">1 (Urgente)</span></td>
            <td><strong>Protección legal RGPD</strong></td>
            <td>Asesor / Abogado local especializado en protección de datos</td>
            <td>Contrato DPA (Encargado del tratamiento), cláusula de privacidad para clínicas y registro de tratamiento.</td>
          </tr>
          <tr>
            <td><span style="background: var(--warning); color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 0.65rem;">2</span></td>
            <td><strong>Creación de la Demo Funcional</strong></td>
            <td>Javier Delgado (EsarIA)</td>
            <td>Un flujo simple montado en Make/n8n conectando un formulario web a Google Calendar y enviando un WhatsApp simulado en 3 min.</td>
          </tr>
          <tr>
            <td><span style="background: var(--accent); color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 0.65rem;">3</span></td>
            <td><strong>Rediseño de Guiones y Pitch</strong></td>
            <td>Javier Delgado (EsarIA)</td>
            <td>Eliminar las palabras "IA", "Automatización" y "Algoritmo". Hablar solo de "ahorro de horas" y "reducción de citas perdidas".</td>
          </tr>
          <tr>
            <td><span style="background: var(--success); color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 0.65rem;">4</span></td>
            <td><strong>Identificación del Decisor</strong></td>
            <td>LinkedIn / Fichas de Google / Web corporativa</td>
            <td>No llamar a ningún lead operativo del CRM sin haber rellenado antes su campo "decisor_nombre" en el JSON de leads.</td>
          </tr>
          <tr>
            <td><span style="background: var(--success); color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 0.65rem;">5</span></td>
            <td><strong>Alianza con Gestorías</strong></td>
            <td>Reuniones presenciales en Valladolid</td>
            <td>Cerrar un acuerdo de referidos con 2 gestorías del centro de la ciudad para acceder a sus clientes de forma directa y recomendada.</td>
          </tr>
        </tbody>
      </table>

      <h2>Conclusión del Auditor de Negocios Senior</h2>
      <p style="font-style: italic; color: var(--subtle); border-left: 2px solid var(--accent); padding-left: 1rem; margin-top: 1rem;">
        "Javier, tu propuesta técnica es sólida y la necesidad del mercado es real: las clínicas y talleres de Valladolid pierden decenas de horas al mes en llamadas y WhatsApps manuales. Sin embargo, no vas a cerrar clientes vendiendo tecnología compleja en frío. Céntrate en resolver el agujero legal del RGPD para poder trabajar con tranquilidad, monta una demo interactiva que asombre visualmente en las reuniones y apaláncate en instituciones de confianza para saltarte la barrera de la desconfianza local. Tienes una gran oportunidad en Valladolid si dejas de hablar como programador y empiezas a hablar como el socio que les va a devolver su tiempo libre."
      </p>
    </div>

    <div class="page-footer">
      <span>EsarIA — Consultoría de Salida al Mercado</span>
      <span>Página 6 de 6</span>
    </div>
  </div>

</body>
</html>
"""


def find_chrome():
    for path in CHROME_CANDIDATES:
        if os.path.exists(path):
            return path
    for cmd in ["google-chrome", "chromium", "chromium-browser"]:
        try:
            r = subprocess.run(["which", cmd], capture_output=True, text=True)
            if r.returncode == 0 and r.stdout.strip():
                return r.stdout.strip()
        except Exception:
            pass
    return None


def via_weasyprint(html, pdf):
    try:
        from weasyprint import HTML as WP
        WP(string=html).write_pdf(str(pdf))
        return True
    except ImportError:
        return False
    except Exception as e:
        print(f"  [AVISO] weasyprint falló: {e}")
        return False


def via_chrome(html_file, pdf, chrome):
    cmd = [
        chrome,
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--run-all-compositor-stages-before-draw",
        f"--print-to-pdf={pdf}",
        f"file://{html_file.resolve()}",
    ]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=45)
        return r.returncode == 0 and pdf.exists()
    except Exception as e:
        print(f"  [AVISO] Chrome headless falló: {e}")
        return False


def main():
    print("[INFO] Generando el HTML temporal de la auditoría...")
    # Crear el directorio pdf si no existe
    HTML_PATH.parent.mkdir(parents=True, exist_ok=True)
    DOCS_PDF_PATH.parent.mkdir(parents=True, exist_ok=True)
    ARTIFACT_PDF_PATH.parent.mkdir(parents=True, exist_ok=True)

    with open(HTML_PATH, "w", encoding="utf-8") as f:
        f.write(HTML_CONTENT)
    print(f"[OK] HTML temporal creado en: {HTML_PATH}")

    # Intentar compilar a PDF
    generado = False

    # 1. weasyprint
    print("[1/2] Probando weasyprint...")
    if via_weasyprint(HTML_CONTENT, PDF_PATH):
        print(f"[OK] PDF generado con weasyprint en: {PDF_PATH}")
        generado = True
    
    # 2. Chrome headless
    if not generado:
        print("[2/2] Probando Chrome headless...")
        chrome = find_chrome()
        if chrome:
            print(f"  Navegador encontrado: {chrome}")
            if via_chrome(HTML_PATH, PDF_PATH, chrome):
                print(f"[OK] PDF generado con Chrome en: {PDF_PATH}")
                generado = True
        else:
            print("  Chrome no encontrado en las rutas típicas.")

    if generado:
        # Copiar el PDF a los destinos requeridos
        import shutil
        try:
            shutil.copy2(PDF_PATH, DOCS_PDF_PATH)
            print(f"[OK] PDF copiado a Drive del proyecto: {DOCS_PDF_PATH}")
        except Exception as e:
            print(f"[AVISO] No se pudo copiar a {DOCS_PDF_PATH}: {e}")

        try:
            shutil.copy2(PDF_PATH, ARTIFACT_PDF_PATH)
            print(f"[OK] PDF copiado a artefactos de la conversación: {ARTIFACT_PDF_PATH}")
        except Exception as e:
            print(f"[AVISO] No se pudo copiar a {ARTIFACT_PDF_PATH}: {e}")

        print("\n¡Proceso completado con éxito! El PDF está listo.")
    else:
        print("\n[ERROR] No se pudo generar el PDF automáticamente.")
        print("Puedes abrir el archivo HTML generado en tu navegador e imprimirlo (Cmd+P) seleccionando 'Guardar como PDF':")
        print(f"  open '{HTML_PATH}'")


if __name__ == "__main__":
    main()
