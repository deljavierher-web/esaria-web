#set document(
  title: "CV - Javier Delgado Hernández - Automatización e IA Aplicada",
  author: "Javier Delgado Hernández",
)

#set page(
  paper: "a4",
  margin: (x: 1.25cm, y: 0.85cm),
)

#set text(
  font: ("Helvetica Neue", "Arial"),
  size: 8.55pt,
  fill: rgb("#1E293B"),
  lang: "es",
)

#set par(
  justify: true,
  leading: 0.42em,
)

#set list(
  spacing: 0.42em,
  body-indent: 0.4em,
)

#let accent = rgb("#4F46E5")
#let dark = rgb("#0F172A")
#let muted = rgb("#64748B")
#let rule_color = rgb("#E2E8F0")

#let section_title(title) = {
  v(0.4em)
  text(size: 10pt, weight: "bold", fill: dark, tracking: 0.4pt)[#upper(title)]
  v(-0.5em)
  line(length: 100%, stroke: 1.1pt + accent)
  v(0.15em)
}

#let project_item(title, subtitle, period, bullets) = {
  grid(
    columns: (1fr, auto),
    column-gutter: 12pt,
    align: (left, right),
    [#text(weight: "bold", size: 9.2pt, fill: dark)[#title] #text(fill: accent, weight: "medium", size: 8.6pt)[| #subtitle]],
    [#text(size: 8.2pt, fill: muted, style: "italic")[#period]],
  )
  v(-0.25em)
  for b in bullets [
    - #b
  ]
  v(0.08em)
}

// HEADER
#grid(
  columns: (1fr, auto),
  column-gutter: 14pt,
  align: (left + horizon, right + horizon),
  [
    #text(size: 18.5pt, weight: "bold", fill: dark)[JAVIER DELGADO HERNÁNDEZ] \
    #v(0.08em)
    #text(size: 10.2pt, weight: "bold", fill: accent)[Especialista en Automatización de Procesos e IA Aplicada (AI Operations & Builder)] \
    #v(0.12em)
    #text(size: 8.4pt, fill: muted)[Valladolid, España · Disponible Presencial en Valladolid, Híbrido o 100% Remoto]
  ],
  [
    #set text(size: 8.3pt)
    #link("https://esaria.es/javier")[*esaria.es/javier*] · #link("https://esaria.es")[esaria.es] \
    #link("https://github.com/deljavierher-web")[github.com/deljavierher-web] \
    #link("mailto:hola@esaria.es")[hola\@esaria.es] · #link("mailto:deljavierher@gmail.com")[deljavierher\@gmail.com] \
    #link("https://wa.me/34614918261")[+34 614 91 82 61] · #link("https://www.linkedin.com/in/javier-delgado-hernández-esaria")[LinkedIn]
  ]
)

#v(0.15em)
#rect(
  width: 100%,
  fill: rgb("#F8FAFC"),
  stroke: (left: 2.5pt + accent, rest: 0.5pt + rule_color),
  inset: (x: 9pt, y: 6pt),
  radius: (right: 4pt),
)[
  #text(size: 8.65pt, fill: dark)[
    *Perfil Profesional:* Desarrollador de soluciones de automatización e integrador de Inteligencia Artificial enfocado en llevar sistemas reales a producción. Especializado en conectar *LLMs, visión artificial (OCR), procesamiento de voz local, APIs REST y flujos agénticos* para eliminar trabajo manual en operaciones empresariales. Combino formación en *Ingeniería Mecánica (UVa)* y *Gestión de la Calidad Industrial* con ingeniería de software asistida por IA (*Claude Code / Codex*), operando actualmente un servidor propio con *22 servicios automatizados 24/7*.
  ]
]

#section_title("Sistemas de IA y Automatización Desplegados en Producción")

#project_item(
  "VisionParking AI — Control de Accesos por Visión en Tiempo Real",
  "Python · Qwen-VL · Telegram API · Flask",
  "En producción (Valladolid)",
  (
    [Sistema desplegado en operativa real de control de accesos de eventos (*Servicio Casetas Regionales / Servisecur* en Valladolid) para verificar vehículos autorizados desde el móvil sin listados en papel.],
    [Pipeline OCR multimodal con *failover* automático (*Qwen-VL-Flash* → *Gemini Flash* → *GPT-4o-mini*) y normalización regex de matrículas españolas (modernas y provinciales) en *~1.0 segundo* por foto o *\<0.2s* por voz/texto.],
    [Cruce en tiempo real contra hojas Excel/CSV de autorizados, auditoría de accesos y panel web de supervisión en vivo expuesto mediante *Cloudflare Tunnel*.],
  )
)

#project_item(
  "iSquad Auto-Actas — Digitalización Manuscrita y Tramitación Federativa",
  "Visión IA · Python · Web Automation",
  "En producción",
  (
    [Automatización integral de *back-office* para arbitraje federado: recibe fotografías de actas manuscritas por Telegram, extrae estadísticas e incidencias mediante visión artificial y estructura un esquema JSON validado.],
    [Ejecuta la subida desatendida al portal oficial *MySquad / iSquad*, descarga el PDF oficial firmado por la federación y lo devuelve automáticamente al árbitro, reduciendo un trámite manual de 15 min a segundos.],
  )
)

#project_item(
  "ERP Conversacional con Agentes y Tool Calling (VictorVape & Chuchi)",
  "FastAPI · SQLite · DeepSeek Tools · Chart.js",
  "En producción",
  (
    [Diseño de un ERP ligero operado en lenguaje natural desde un grupo de Telegram para socios comerciales, eliminando la fricción de introducir datos manualmente en formularios complejos.],
    [Implementación de *11 herramientas estructuradas (JSON Tool Calling)* con reglas de negocio estrictas (control de stock, precios de compra/venta, alertas de rotura, compras combinadas y balances financieros) + Dashboard web con autenticación y gráficas interactivas.],
  )
)

#project_item(
  "EsarIA — Automatización B2B, Bots de WhatsApp y Triaje para Talleres",
  "Node.js · WhatsApp Cloud API · n8n · Docker",
  "2026 – Actualidad",
  (
    [Creación de la marca local *EsarIA (esaria.es)* enfocada en automatización práctica para pymes de Valladolid (clínicas, talleres mecánicos, gimnasios y comercios).],
    [Desarrollo de backend modular en *Node.js* para *WhatsApp Business Cloud API* con arquitectura multi-proveedor (*Ollama local, DeepSeek, OpenAI-compatible*) y orquestación de flujos en *n8n* sobre Docker.],
    [Prototipo funcional de *Operador IA para Talleres Mecánicos*: recibe mensajes desordenados de clientes sobre averías, clasifica gravedad (frenos, temperatura, dirección), detecta datos faltantes del vehículo y genera la ficha previa de recepción.],
  )
)

#project_item(
  "Infraestructura Agéntica 24/7 (DSH/Hermes) & Suite Académica SAML (muse-estudios)",
  "macOS launchd · SAML · Whisper · MCP",
  "En producción",
  (
    [Arquitectura de agente personal autónomo con *22 demonios activos en `launchd`*, enrutamiento híbrido multi-modelo con *failover* ante errores `HTTP 429`, benchmarks propios de latencia TTFT y síntesis/transcripción de voz local (*OmniVoice* + *faster-whisper* + servidor *MCP*).],
    [Motor en Python de autenticación *SAML/ADFS* y scraping incremental para campus *Moodle (UVa y Educacyl)* con clasificación automática de apuntes por IA, sincronización con Google Drive/Calendar, generación de informes en *Typst* y suite de tests unitarios de sanitización (`unittest`).],
  )
)

#section_title("Stack Tecnológico y Competencias")

#grid(
  columns: (1fr, 1fr),
  column-gutter: 14pt,
  [
    - *IA Aplicada & Agentes:* Integración de APIs LLM (OpenAI, DeepSeek, Claude, Gemini, Qwen), *Tool Calling* & JSON Schemas, Visión/OCR Multimodal, STT/TTS Local (*faster-whisper*, *whisper.cpp*, *OmniVoice*), *MCP*, Ollama.
    - *Automatización & Integraciones:* *n8n* (Docker), Make, Webhooks REST, *WhatsApp Business Cloud API*, *Telegram Bot API*, Google Workspace API, iCalendar (RFC 5545), Scraping & SAML Auth.
  ],
  [
    - *Backend, Web & Datos:* Python (*FastAPI*, *Flask*, *SQLAlchemy*, *requests*), JavaScript / Node.js (*Express*), SQL (*SQLite*), HTML5/CSS3, Kotlin (*Jetpack Compose* básico).
    - *Ingeniería Asistida & Ops:* Desarrollo acelerado con agentes (*Claude Code*, *Codex*, *Antigravity*), Git/GitHub, Cloudflare Pages & Tunnels, administración de servicios `launchd`/Bash, *Typst*.
  ]
)

#section_title("Formación Académica y Experiencia Operativa")

#grid(
  columns: (1fr, auto),
  column-gutter: 12pt,
  row-gutter: 4pt,
  [*Grado en Ingeniería Mecánica* (En curso) — *Universidad de Valladolid (UVa)* | Base analítica, procesos industriales e informática aplicada.],
  [#text(size: 8.2pt, fill: muted)[Valladolid]],
  [*Técnico Superior en Gestión de la Calidad, Prevención y Protección Ambiental* (En curso) — *CIFP Juan de Herrera* | Estandarización de procesos, auditoría documental y mejora continua.],
  [#text(size: 8.2pt, fill: muted)[Valladolid]],
  [*Operativa en Eventos, Seguridad y Arbitraje Federado* — *Grupo Midgar / Servisecur & Fed. Balonmano CyL* | Identificación de cuellos de botella en terreno real y despliegue de herramientas propias de IA para resolverlos.],
  [#text(size: 8.2pt, fill: muted)[Valladolid]],
)
