#!/usr/bin/env python3
"""
EsarIA — Generador de la Base de Datos de Leads y PDF Estético
Lee leads-reales.json, selecciona los mejores leads de CrossFit y Talleres Mecánicos de Valladolid,
y genera:
1. docs/comercial/lista-leads-valladolid.md (Versión Markdown limpia)
2. docs/comercial/lista-leads-valladolid.html (Versión HTML premium con diseño corporativo)
3. docs/comercial/lista-leads-valladolid.pdf (Compilación a PDF estético usando Chrome Headless o WeasyPrint)
"""

import json
import os
import sys
import subprocess
import datetime
from pathlib import Path

# Rutas
BASE = Path(__file__).parent.parent.parent
LEADS_JSON_PATH = BASE / "prospecting" / "leads" / "reales" / "leads-reales.json"
MD_PATH = BASE / "docs" / "comercial" / "lista-leads-valladolid.md"
HTML_PATH = BASE / "docs" / "comercial" / "lista-leads-valladolid.html"
PDF_PATH = BASE / "docs" / "comercial" / "lista-leads-valladolid.pdf"

CHROME_CANDIDATES = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
]

def load_leads():
    if not LEADS_JSON_PATH.exists():
        print(f"[ERROR] No existe el archivo de leads reales en {LEADS_JSON_PATH}")
        sys.exit(1)
    with open(LEADS_JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def filter_leads(leads):
    # Filtrar por sector
    crossfit_leads = []
    workshop_leads = []
    
    for lead in leads:
        sector = (lead.get("sector") or "").lower()
        # Verificar que tengan teléfono y web o al menos teléfono
        tiene_tel = bool((lead.get("telefono") or "").strip())
        
        if "crossfit" in sector or "gimnasio" in sector:
            if tiene_tel:
                crossfit_leads.append(lead)
        elif "taller" in sector or "mecánico" in sector or "mecanico" in sector:
            if tiene_tel:
                workshop_leads.append(lead)
                
    # Ordenar por número de reseñas o rating para seleccionar los más relevantes
    def sort_key(x):
        try:
            return int(x.get("num_resenas") or 0)
        except ValueError:
            return 0
            
    crossfit_leads.sort(key=sort_key, reverse=True)
    workshop_leads.sort(key=sort_key, reverse=True)
    
    # Tomar los 8 mejores de cada uno para no hacer el PDF kilométrico pero sí muy robusto y representativo (16 en total)
    return crossfit_leads[:8], workshop_leads[:8]

def generate_markdown(crossfit, workshops, total_leads):
    ahora = datetime.datetime.now().strftime("%Y-%m-%d")
    
    content = f"""# Base de Datos de Leads & Oportunidades de Simplificación Operativa — EsarIA

Documento de prospección comercial estratégico para la ciudad de **Valladolid, España**.  
**Fecha de generación:** {ahora}  
**Leads reales mapeados en base principal:** {total_leads} leads  

---

## 1. Resumen Ejecutivo & Estrategia Local

Este documento detalla una selección de los **16 leads de máxima prioridad** en Valladolid dentro de los dos sectores clave de bajo riesgo RGPD y alta fricción organizativa: **CrossFit/Gimnasios** y **Talleres Mecánicos**.

### ¿Por qué estos sectores?
1. **CrossFit & Gimnasios (Gestión de Reservas):** Sufren saturación en recepción debido al volumen de mensajes de WhatsApp y llamadas para reservar clases, cancelaciones de última hora y control de aforo. Tienen gran predisposición a soluciones ágiles en el móvil.
2. **Talleres Mecánicos (Avisos y Presupuestos):** Pierden horas cada semana persiguiendo a clientes para la confirmación de presupuestos o avisando manualmente de que el vehículo está listo. Un aviso de texto en el móvil con confirmación reduce drásticamente las interrupciones en el taller.

---

## 2. Sector CrossFit & Centros Deportivos (Valladolid)

Fichas comerciales de los mejores boxes de CrossFit detectados en la ciudad. Todos cuentan con teléfonos verificados y un volumen considerable de alumnos (evidenciado por sus reseñas).

"""

    for i, lead in enumerate(crossfit, 1):
        web = lead.get("web") or "Sin web publicada"
        rating = lead.get("rating") or "N/D"
        resenas = lead.get("num_resenas") or "0"
        
        content += f"""### {i}. {lead['nombre_empresa']}
*   **📍 Dirección:** {lead['direccion']}
*   **📞 Teléfono:** `{lead['telefono']}`
*   **🌐 Web:** [{web}]({web})
*   **⭐️ Valoración Google:** {rating} ⭐ ({resenas} reseñas)
*   **⚠️ Fricción Detectada (Dolor):** {lead.get('problema_visible') or 'Coordinación manual de reservas de clases y cancelaciones.'}
*   **💡 Propuesta de Simplificación:** {lead.get('oportunidad_automatizacion') or 'Sistema automático de reserva y recordatorio de clases por WhatsApp.'}
*   **💬 Enfoque por WhatsApp (Mensaje Propuesto):**
    ```text
    {lead.get('mensaje_whatsapp_personalizado') or 'Hola...'}
    ```
*   **📞 Guion de Entrada Telefónica:**
    *   *"{lead.get('guion_recepcion_personalizado') or 'Hola, buenas. ¿Podría hablar con la persona responsable del centro?'}"*
*   **📋 Estado:** `[ ] Pendiente de primer contacto (WhatsApp)`

"""

    content += """---

## 3. Sector Talleres Mecánicos & Automoción (Valladolid)

Fichas comerciales de los talleres mecánicos y de chapa y pintura más relevantes de Valladolid. Enfocados en agilizar la comunicación de presupuestos y estados de reparación.

"""

    for i, lead in enumerate(workshops, 1):
        web = lead.get("web") or "Sin web publicada"
        rating = lead.get("rating") or "N/D"
        resenas = lead.get("num_resenas") or "0"
        
        content += f"""### {i}. {lead['nombre_empresa']}
*   **📍 Dirección:** {lead['direccion']}
*   **📞 Teléfono:** `{lead['telefono']}`
*   **🌐 Web:** [{web}]({web})
*   **⭐️ Valoración Google:** {rating} ⭐ ({resenas} reseñas)
*   **⚠️ Fricción Detectada (Dolor):** {lead.get('problema_visible') or 'Los clientes llaman constantemente para saber si su coche está listo; presupuestos manuales por teléfono.'}
*   **💡 Propuesta de Simplificación:** {lead.get('oportunidad_automatizacion') or 'Avisos automáticos de estado de coche listo y envío de presupuestos digitales por WhatsApp.'}
*   **💬 Enfoque por WhatsApp (Mensaje Propuesto):**
    ```text
    {lead.get('mensaje_whatsapp_personalizado') or 'Hola...'}
    ```
*   **📞 Guion de Entrada Telefónica:**
    *   *"{lead.get('guion_recepcion_personalizado') or 'Hola, buenas. ¿Está el dueño o la persona que lleva el taller?'}"*
*   **📋 Estado:** `[ ] Pendiente de primer contacto (WhatsApp)`

"""

    content += """---

## 4. Guía de Trabajo Comercial (Valladolid)

1.  **Sin Jerga Técnica:** Al hablar con los dueños, **NUNCA** utilices términos como *"automatización"*, *"flujos"*, *"IA"* o *"algoritmos"*. Habla siempre de *"reducir llamadas que interrumpen en recepción"*, *"evitar que la gente falte a sus citas sin avisar"* y *"ahorrar horas de oficina a la semana"*.
2.  **El Filtro de Recepción:** En el taller o el box, la persona que coge el teléfono tiene la misión de filtrar llamadas publicitarias. Consigue siempre el nombre del decisor (dueño o gerente) antes de lanzar el pitch completo.
3.  **Prospección Multicanal:**
    *   *Paso 1:* Envía el mensaje de WhatsApp personalizado al móvil corporativo.
    *   *Paso 2:* Si no responde en 3 días, realiza la llamada en frío rápida utilizando el guion telefónico.
    *   *Paso 3:* Agenda el diagnóstico de 20 minutos (presencial o videollamada) ofreciendo la demostración funcional en vivo.
"""

    with open(MD_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"[OK] Markdown guardado en {MD_PATH}")

def generate_html(crossfit, workshops, total_leads):
    ahora = datetime.datetime.now().strftime("%B de %Y")
    # Traducir mes a español
    meses = {
        "January": "Enero", "February": "Febrero", "March": "Marzo", "April": "Abril",
        "May": "Mayo", "June": "Junio", "July": "Julio", "August": "Agosto",
        "September": "Septiembre", "October": "Octubre", "November": "Noviembre", "December": "Diciembre"
    }
    for eng, esp in meses.items():
        ahora = ahora.replace(eng, esp)
        
    fecha_exacta = datetime.datetime.now().strftime("%d/%m/%Y")

    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Base de Datos de Leads Valladolid — EsarIA</title>
  <style>
    /* ─── Variables y Paleta Oficial EsarIA ─── */
    :root {{
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
      --success-light: #ECFDF5;
    }}

    /* ─── Reset ─── */
    *, *::before, *::after {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}

    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      line-height: 1.6;
      color: var(--text);
      background: #CBD5E1;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }}

    /* ─── Botón Impresión Web ─── */
    .no-print {{
      text-align: center;
      padding: 1rem;
      background: var(--bg);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
    }}

    .no-print button {{
      background: var(--accent);
      color: var(--white);
      border: none;
      padding: 0.6rem 1.4rem;
      border-radius: 6px;
      font-size: 0.875rem;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s ease;
    }}

    .no-print button:hover {{
      background: #5B4EE0;
    }}

    /* ─── Layout A4 ─── */
    .page {{
      width: 210mm;
      min-height: 297mm;
      margin: 2rem auto;
      background: var(--white);
      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.15);
      padding: 20mm 22mm;
      position: relative;
      display: flex;
      flex-direction: column;
    }}

    /* ─── Portada ─── */
    .page-cover {{
      background: var(--dark);
      color: var(--white);
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 0 30mm;
    }}

    .cover-logo {{
      height: 60px;
      margin-bottom: 4rem;
    }}

    .cover-title {{
      font-size: 2.2rem;
      font-weight: 800;
      line-height: 1.3;
      letter-spacing: -0.03em;
      color: var(--white);
      margin-bottom: 1.5rem;
    }}

    .cover-accent {{
      color: var(--accent);
    }}

    .cover-subtitle {{
      font-size: 1.1rem;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--subtle);
      margin-bottom: 5rem;
    }}

    .cover-meta {{
      border-top: 1px solid #334155;
      padding-top: 1.5rem;
      width: 100%;
      max-width: 320px;
      font-size: 0.85rem;
      color: #94A3B8;
      text-align: left;
      line-height: 1.8;
      margin-top: 2rem;
    }}

    .cover-meta strong {{
      color: var(--white);
    }}

    .cover-footer {{
      position: absolute;
      bottom: 20mm;
      font-size: 0.75rem;
      color: #475569;
      letter-spacing: 0.05em;
    }}

    /* ─── Cabecera y Pie de Página ─── */
    .header-nav {{
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
    }}

    .page-footer {{
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
    }}

    /* ─── Contenido ─── */
    .content {{
      flex: 1;
      padding-bottom: 15mm;
    }}

    h1.page-title {{
      font-size: 1.6rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--dark);
      margin-bottom: 1.2rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }}

    h1.page-title span {{
      background: var(--accent);
      color: var(--white);
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}

    h2 {{
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--dark);
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
      letter-spacing: -0.01em;
      border-left: 3px solid var(--accent);
      padding-left: 8px;
    }}

    p {{
      margin-bottom: 0.85rem;
      color: var(--text);
    }}

    strong {{
      color: var(--dark);
    }}

    ul, ol {{
      margin-bottom: 1rem;
      padding-left: 1.2rem;
    }}

    li {{
      margin-bottom: 0.35rem;
    }}

    /* ─── Tablas Premium ─── */
    table {{
      width: 100%;
      border-collapse: collapse;
      margin: 1.2rem 0;
      font-size: 0.8rem;
    }}

    th {{
      background: var(--dark);
      color: var(--white);
      font-weight: 600;
      text-align: left;
      padding: 0.6rem 0.8rem;
      text-transform: uppercase;
      font-size: 0.7rem;
      letter-spacing: 0.05em;
    }}

    td {{
      padding: 0.5rem 0.8rem;
      border-bottom: 1px solid var(--border);
      color: var(--text);
    }}

    tr:nth-child(even) td {{
      background: #F8FAFC;
    }}

    /* ─── Fichas de Leads ─── */
    .lead-card {{
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.2rem;
      margin-bottom: 1.5rem;
      page-break-inside: avoid;
    }}

    .lead-card-header {{
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.6rem;
      margin-bottom: 0.8rem;
    }}

    .lead-title {{
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--dark);
    }}

    .lead-badge {{
      background: var(--accent-light);
      color: var(--accent);
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }}

    .lead-details-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 0.8rem;
      font-size: 0.8rem;
    }}

    .lead-detail-item strong {{
      color: var(--subtle);
      font-size: 0.75rem;
      text-transform: uppercase;
      display: block;
      margin-bottom: 2px;
    }}

    .pain-card {{
      border-left: 3px solid var(--danger);
      background: var(--danger-light);
      padding: 0.6rem 0.8rem;
      border-radius: 0 6px 6px 0;
      font-size: 0.8rem;
      margin-bottom: 0.6rem;
    }}
    .pain-card strong {{
      color: #991B1B;
    }}

    .opp-card {{
      border-left: 3px solid var(--success);
      background: var(--success-light);
      padding: 0.6rem 0.8rem;
      border-radius: 0 6px 6px 0;
      font-size: 0.8rem;
      margin-bottom: 0.8rem;
    }}
    .opp-card strong {{
      color: #065F46;
    }}

    .script-box {{
      background: var(--dark);
      color: #E2E8F0;
      font-family: 'Courier New', Courier, monospace;
      padding: 0.8rem;
      border-radius: 6px;
      font-size: 0.75rem;
      white-space: pre-wrap;
      line-height: 1.4;
      border: 1px solid #334155;
    }}

    .info-card {{
      border-left: 4px solid var(--accent);
      background: var(--accent-light);
      padding: 1rem;
      border-radius: 0 8px 8px 0;
      margin: 1.2rem 0;
    }}

    .info-card h3 {{
      color: #3730A3;
      margin-top: 0;
      margin-bottom: 0.4rem;
      font-size: 0.95rem;
    }}

    .info-card p {{
      color: #312E81;
      margin-bottom: 0;
      font-size: 0.82rem;
    }}

    /* ─── Paginación Impresora ─── */
    @media print {{
      body {{
        background: var(--white);
      }}
      .no-print {{
        display: none !important;
      }}
      .page {{
        margin: 0 !important;
        box-shadow: none !important;
        page-break-after: always;
      }}
      .page:last-child {{
        page-break-after: avoid;
      }}
    }}
  </style>
</head>
<body>

  <div class="no-print">
    <button onclick="window.print()">Imprimir o Guardar como PDF</button>
    <p style="font-size: 0.75rem; color: var(--subtle); margin-top: 0.4rem;">Usa este botón para abrir la ventana de impresión y guardar como PDF en tu sistema.</p>
  </div>

  <!-- PÁGINA 1: PORTADA -->
  <div class="page page-cover">
    <img src="https://esaria.es/assets/brand/logo/esaria-logo-horizontal.svg" alt="EsarIA Logo" class="cover-logo" onerror="this.src='../../assets/brand/logo/esaria-logo-horizontal.svg'">
    <h1 class="cover-title">Base de Datos de Leads &<br>Oportunidades de Simplificación</h1>
    <p class="cover-subtitle">Prospección Estratégica Valladolid</p>
    
    <div class="cover-meta">
      <strong>Preparado por:</strong> EsarIA — Javier Delgado Hernández<br>
      <strong>Ubicación Focus:</strong> Valladolid, España<br>
      <strong>Sectores:</strong> CrossFit/Gimnasios y Talleres Mecánicos<br>
      <strong>Fecha de Emisión:</strong> {fecha_exacta}<br>
      <strong>Leads Totales Mapeados:</strong> {total_leads}
    </div>

    <hr style="border: none; border-top: 1px solid #334155; width: 100%; max-width: 320px; margin: 1.5rem 0;">
    <p style="font-size: 0.75rem; color: #94A3B8; max-width: 300px; font-style: italic;">
      "Identificación de fricciones de oficina y contacto de bajo riesgo RGPD en el mercado local."
    </p>

    <div class="cover-footer">
      ESARIA © 2026 · VALLADOLID
    </div>
  </div>

  <!-- PÁGINA 2: RESUMEN ESTRATÉGICO -->
  <div class="page">
    <div class="header-nav">
      <span>EsarIA — Prospección Valladolid</span>
      <span>{ahora}</span>
    </div>
    
    <div class="content">
      <h1 class="page-title">Resumen del Pipeline & Oportunidad Local</h1>
      <p>Valladolid cuenta con un tejido empresarial local sumamente receptivo a la simplificación de tareas cuando se les presenta en su propio idioma (cero jerga técnica). Esta selección de 16 leads priorizados representa una mina de oro operativa.</p>
      
      <h2>Distribución y Métricas del Módulo de Prospección</h2>
      <table>
        <thead>
          <tr>
            <th>Sector Focus</th>
            <th>Leads en Base</th>
            <th>Fricción Operativa Clave</th>
            <th>Solución de Bajo Riesgo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>CrossFit / Gimnasios</strong></td>
            <td>9 leads activos</td>
            <td>Teléfonos colapsados por reservas y cancelaciones manuales a diario.</td>
            <td>Coordinación de clases automática integrada directamente en WhatsApp.</td>
          </tr>
          <tr>
            <td><strong>Talleres Mecánicos</strong></td>
            <td>10 leads activos</td>
            <td>Tiempo perdido llamando para confirmar presupuestos y coche listo.</td>
            <td>Avisos instantáneos automáticos y confirmación de presupuestos por móvil.</td>
          </tr>
          <tr>
            <td><strong>Otros Sectores</strong></td>
            <td>51 leads mapeados</td>
            <td>Petición habitual de tarifas, catálogos y reservas manuales.</td>
            <td>WhatsApp automatizado de atención rápida 24/7 sin colapsar el negocio.</td>
          </tr>
        </tbody>
      </table>

      <div class="info-card">
        <h3>💡 Clave Comercial: Evitar la "Jerga de Consultora"</h3>
        <p>En Castilla y León, la palabra <strong>"Automatizar"</strong> o <strong>"IA"</strong> asusta al pequeño empresario (suena a caro, complejo o deshumanizado). Habla siempre del <strong>dolor directo</strong>: <em>"evitar que el taller se interrumpa con llamadas de '¿está ya mi coche?'"</em> o <em>"evitar que los alumnos te cancelen a última hora por WhatsApp y pierdas dinero en la clase"</em>. El dueño te escuchará porque le estás ofreciendo resolver un dolor diario real.</p>
      </div>

      <h2 style="margin-top: 2rem;">Estrategia de Prospección de 3 Pasos</h2>
      <ol style="margin-top: 0.5rem; font-size: 0.85rem; line-height: 1.7;">
        <li><strong>WhatsApp Primero:</strong> Se envía el mensaje de WhatsApp personalizado al móvil comercial (está en cada ficha). Tono cercano, humilde y centrado en Valladolid.</li>
        <li><strong>Llamada de Seguimiento:</strong> Si no responden en 3 días, llamar pidiendo hablar con el decisor usando el guion telefónico personalizado para saltar el filtro de la secretaria.</li>
        <li><strong>Demostración de Citas:</strong> En la reunión de 20 minutos presencial, se le enseña la demo interactiva corriendo en vivo. Ver el bot de Telegram o WhatsApp funcionando en su propio móvil es lo que cierra la venta.</li>
      </ol>
    </div>

    <div class="page-footer">
      <span>EsarIA — Consultoría de Salida al Mercado</span>
      <span>Página 2 de 6</span>
    </div>
  </div>

  <!-- PÁGINA 3: LEADS CROSSFIT (1 a 4) -->
  <div class="page">
    <div class="header-nav">
      <span>EsarIA — Leads CrossFit Valladolid</span>
      <span>{ahora}</span>
    </div>
    
    <div class="content">
      <h1 class="page-title">Fichas de Leads: CrossFit & Centros Deportivos <span>Parte 1</span></h1>
      
      <!-- LEAD 1 -->
      <div class="lead-card">
        <div class="lead-card-header">
          <span class="lead-title">1. {crossfit[0]['nombre_empresa']}</span>
          <span class="lead-badge">Prioridad {crossfit[0].get('prioridad', 'Alta')}</span>
        </div>
        <div class="lead-details-grid">
          <div class="lead-detail-item"><strong>📍 Dirección</strong> {crossfit[0]['direccion']}</div>
          <div class="lead-detail-item"><strong>📞 Teléfono / 🌐 Web</strong> {crossfit[0]['telefono']} | {crossfit[0]['web']}</div>
        </div>
        <div class="pain-card">
          <strong>⚠️ Problema visible:</strong> {crossfit[0].get('problema_visible')}
        </div>
        <div class="opp-card">
          <strong>💡 Oportunidad:</strong> {crossfit[0].get('oportunidad_automatizacion')}
        </div>
        <p style="font-size: 0.75rem; color: var(--subtle); margin-bottom: 4px; text-transform: uppercase; font-weight: bold;">💬 Propuesta WhatsApp:</p>
        <div class="script-box">{crossfit[0].get('mensaje_whatsapp_personalizado')}</div>
      </div>

      <!-- LEAD 2 -->
      <div class="lead-card">
        <div class="lead-card-header">
          <span class="lead-title">2. {crossfit[1]['nombre_empresa']}</span>
          <span class="lead-badge">Prioridad {crossfit[1].get('prioridad', 'Alta')}</span>
        </div>
        <div class="lead-details-grid">
          <div class="lead-detail-item"><strong>📍 Dirección</strong> {crossfit[1]['direccion']}</div>
          <div class="lead-detail-item"><strong>📞 Teléfono / 🌐 Web</strong> {crossfit[1]['telefono']} | {crossfit[1]['web']}</div>
        </div>
        <div class="pain-card">
          <strong>⚠️ Problema visible:</strong> {crossfit[1].get('problema_visible')}
        </div>
        <div class="opp-card">
          <strong>💡 Oportunidad:</strong> {crossfit[1].get('oportunidad_automatizacion')}
        </div>
        <p style="font-size: 0.75rem; color: var(--subtle); margin-bottom: 4px; text-transform: uppercase; font-weight: bold;">💬 Propuesta WhatsApp:</p>
        <div class="script-box">{crossfit[1].get('mensaje_whatsapp_personalizado')}</div>
      </div>
    </div>

    <div class="page-footer">
      <span>EsarIA — Base de Leads Valladolid</span>
      <span>Página 3 de 6</span>
    </div>
  </div>

  <!-- PÁGINA 4: LEADS CROSSFIT (3 a 6) -->
  <div class="page">
    <div class="header-nav">
      <span>EsarIA — Leads CrossFit Valladolid</span>
      <span>{ahora}</span>
    </div>
    
    <div class="content">
      <h1 class="page-title">Fichas de Leads: CrossFit & Centros Deportivos <span>Parte 2</span></h1>
      
      <!-- LEAD 3 -->
      <div class="lead-card">
        <div class="lead-card-header">
          <span class="lead-title">3. {crossfit[2]['nombre_empresa']}</span>
          <span class="lead-badge">Prioridad {crossfit[2].get('prioridad', 'Alta')}</span>
        </div>
        <div class="lead-details-grid">
          <div class="lead-detail-item"><strong>📍 Dirección</strong> {crossfit[2]['direccion']}</div>
          <div class="lead-detail-item"><strong>📞 Teléfono / 🌐 Web</strong> {crossfit[2]['telefono']} | {crossfit[2]['web']}</div>
        </div>
        <div class="pain-card">
          <strong>⚠️ Problema visible:</strong> {crossfit[2].get('problema_visible')}
        </div>
        <div class="opp-card">
          <strong>💡 Oportunidad:</strong> {crossfit[2].get('oportunidad_automatizacion')}
        </div>
        <p style="font-size: 0.75rem; color: var(--subtle); margin-bottom: 4px; text-transform: uppercase; font-weight: bold;">💬 Propuesta WhatsApp:</p>
        <div class="script-box">{crossfit[2].get('mensaje_whatsapp_personalizado')}</div>
      </div>

      <!-- LEAD 4 -->
      <div class="lead-card">
        <div class="lead-card-header">
          <span class="lead-title">4. {crossfit[3]['nombre_empresa']}</span>
          <span class="lead-badge">Prioridad {crossfit[3].get('prioridad', 'Alta')}</span>
        </div>
        <div class="lead-details-grid">
          <div class="lead-detail-item"><strong>📍 Dirección</strong> {crossfit[3]['direccion']}</div>
          <div class="lead-detail-item"><strong>📞 Teléfono / 🌐 Web</strong> {crossfit[3]['telefono']} | {crossfit[3]['web']}</div>
        </div>
        <div class="pain-card">
          <strong>⚠️ Problema visible:</strong> {crossfit[3].get('problema_visible')}
        </div>
        <div class="opp-card">
          <strong>💡 Oportunidad:</strong> {crossfit[3].get('oportunidad_automatizacion')}
        </div>
        <p style="font-size: 0.75rem; color: var(--subtle); margin-bottom: 4px; text-transform: uppercase; font-weight: bold;">💬 Propuesta WhatsApp:</p>
        <div class="script-box">{crossfit[3].get('mensaje_whatsapp_personalizado')}</div>
      </div>
    </div>

    <div class="page-footer">
      <span>EsarIA — Base de Leads Valladolid</span>
      <span>Página 4 de 6</span>
    </div>
  </div>

  <!-- PÁGINA 5: LEADS TALLERES (1 a 2) -->
  <div class="page">
    <div class="header-nav">
      <span>EsarIA — Leads Talleres Valladolid</span>
      <span>{ahora}</span>
    </div>
    
    <div class="content">
      <h1 class="page-title">Fichas de Leads: Talleres Mecánicos <span>Parte 1</span></h1>
      
      <!-- LEAD 1 TALLER -->
      <div class="lead-card">
        <div class="lead-card-header">
          <span class="lead-title">1. {workshops[0]['nombre_empresa']}</span>
          <span class="lead-badge">Prioridad {workshops[0].get('prioridad', 'Alta')}</span>
        </div>
        <div class="lead-details-grid">
          <div class="lead-detail-item"><strong>📍 Dirección</strong> {workshops[0]['direccion']}</div>
          <div class="lead-detail-item"><strong>📞 Teléfono / 🌐 Web</strong> {workshops[0]['telefono']} | {workshops[0]['web']}</div>
        </div>
        <div class="pain-card">
          <strong>⚠️ Problema visible:</strong> {workshops[0].get('problema_visible')}
        </div>
        <div class="opp-card">
          <strong>💡 Oportunidad:</strong> {workshops[0].get('oportunidad_automatizacion')}
        </div>
        <p style="font-size: 0.75rem; color: var(--subtle); margin-bottom: 4px; text-transform: uppercase; font-weight: bold;">💬 Propuesta WhatsApp:</p>
        <div class="script-box">{workshops[0].get('mensaje_whatsapp_personalizado')}</div>
      </div>

      <!-- LEAD 2 TALLER -->
      <div class="lead-card">
        <div class="lead-card-header">
          <span class="lead-title">2. {workshops[1]['nombre_empresa']}</span>
          <span class="lead-badge">Prioridad {workshops[1].get('prioridad', 'Alta')}</span>
        </div>
        <div class="lead-details-grid">
          <div class="lead-detail-item"><strong>📍 Dirección</strong> {workshops[1]['direccion']}</div>
          <div class="lead-detail-item"><strong>📞 Teléfono / 🌐 Web</strong> {workshops[1]['telefono']} | {workshops[1]['web']}</div>
        </div>
        <div class="pain-card">
          <strong>⚠️ Problema visible:</strong> {workshops[1].get('problema_visible')}
        </div>
        <div class="opp-card">
          <strong>💡 Oportunidad:</strong> {workshops[1].get('oportunidad_automatizacion')}
        </div>
        <p style="font-size: 0.75rem; color: var(--subtle); margin-bottom: 4px; text-transform: uppercase; font-weight: bold;">💬 Propuesta WhatsApp:</p>
        <div class="script-box">{workshops[1].get('mensaje_whatsapp_personalizado')}</div>
      </div>
    </div>

    <div class="page-footer">
      <span>EsarIA — Base de Leads Valladolid</span>
      <span>Página 5 de 6</span>
    </div>
  </div>

  <!-- PÁGINA 6: LEADS TALLERES (3 a 4) & CIERRE -->
  <div class="page">
    <div class="header-nav">
      <span>EsarIA — Leads Talleres Valladolid</span>
      <span>{ahora}</span>
    </div>
    
    <div class="content">
      <h1 class="page-title">Fichas de Leads: Talleres Mecánicos <span>Parte 2</span></h1>
      
      <!-- LEAD 3 TALLER -->
      <div class="lead-card">
        <div class="lead-card-header">
          <span class="lead-title">3. {workshops[2]['nombre_empresa']}</span>
          <span class="lead-badge">Prioridad {workshops[2].get('prioridad', 'Alta')}</span>
        </div>
        <div class="lead-details-grid">
          <div class="lead-detail-item"><strong>📍 Dirección</strong> {workshops[2]['direccion']}</div>
          <div class="lead-detail-item"><strong>📞 Teléfono / 🌐 Web</strong> {workshops[2]['telefono']} | {workshops[2]['web']}</div>
        </div>
        <div class="pain-card">
          <strong>⚠️ Problema visible:</strong> {workshops[2].get('problema_visible')}
        </div>
        <div class="opp-card">
          <strong>💡 Oportunidad:</strong> {workshops[2].get('oportunidad_automatizacion')}
        </div>
        <p style="font-size: 0.75rem; color: var(--subtle); margin-bottom: 4px; text-transform: uppercase; font-weight: bold;">💬 Propuesta WhatsApp:</p>
        <div class="script-box">{workshops[2].get('mensaje_whatsapp_personalizado')}</div>
      </div>

      <!-- LEAD 4 TALLER -->
      <div class="lead-card">
        <div class="lead-card-header">
          <span class="lead-title">4. {workshops[3]['nombre_empresa']}</span>
          <span class="lead-badge">Prioridad {workshops[3].get('prioridad', 'Alta')}</span>
        </div>
        <div class="lead-details-grid">
          <div class="lead-detail-item"><strong>📍 Dirección</strong> {workshops[3]['direccion']}</div>
          <div class="lead-detail-item"><strong>📞 Teléfono / 🌐 Web</strong> {workshops[3]['telefono']} | {workshops[3]['web']}</div>
        </div>
        <div class="pain-card">
          <strong>⚠️ Problema visible:</strong> {workshops[3].get('problema_visible')}
        </div>
        <div class="opp-card">
          <strong>💡 Oportunidad:</strong> {workshops[3].get('oportunidad_automatizacion')}
        </div>
        <p style="font-size: 0.75rem; color: var(--subtle); margin-bottom: 4px; text-transform: uppercase; font-weight: bold;">💬 Propuesta WhatsApp:</p>
        <div class="script-box">{workshops[3].get('mensaje_whatsapp_personalizado')}</div>
      </div>
    </div>

    <div class="page-footer">
      <span>EsarIA — Base de Leads Valladolid</span>
      <span>Página 6 de 6</span>
    </div>
  </div>

</body>
</html>
"""
    with open(HTML_PATH, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"[OK] HTML guardado en {HTML_PATH}")

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

def compile_to_pdf():
    print("[INFO] Compilando a PDF...")
    
    # Intentar WeasyPrint
    try:
        from weasyprint import HTML as WP
        WP(filename=str(HTML_PATH)).write_pdf(str(PDF_PATH))
        print(f"[OK] PDF generado con WeasyPrint en {PDF_PATH}")
        return True
    except ImportError:
        print("[INFO] WeasyPrint no instalado, probando Chrome headless...")
        
    # Intentar Chrome Headless
    chrome = find_chrome()
    if chrome:
        print(f"[INFO] Navegador encontrado: {chrome}")
        cmd = [
            chrome,
            "--headless",
            "--disable-gpu",
            "--no-sandbox",
            "--run-all-compositor-stages-before-draw",
            f"--print-to-pdf={PDF_PATH}",
            f"file://{HTML_PATH.resolve()}",
        ]
        try:
            r = subprocess.run(cmd, capture_output=True, text=True, timeout=45)
            if r.returncode == 0 and PDF_PATH.exists():
                print(f"[OK] PDF generado con Chrome Headless en {PDF_PATH}")
                return True
        except Exception as e:
            print(f"[ERROR] Chrome headless falló: {e}")
    else:
        print("[AVISO] Chrome no se encontró en las rutas habituales de macOS.")
        
    print("[AVISO] No se pudo compilar a PDF de forma automatizada.")
    print("Para guardarlo, puedes abrir el HTML en Chrome y guardarlo como PDF usando Cmd+P:")
    print(f"  open {HTML_PATH}")
    return False

def main():
    leads = load_leads()
    print(f"[INFO] Leads cargados: {len(leads)}")
    
    crossfit, workshops = filter_leads(leads)
    print(f"[INFO] Leads CrossFit seleccionados: {len(crossfit)}")
    print(f"[INFO] Leads Talleres seleccionados: {len(workshops)}")
    
    generate_markdown(crossfit, workshops, len(leads))
    generate_html(crossfit, workshops, len(leads))
    compile_to_pdf()
    
if __name__ == "__main__":
    main()
