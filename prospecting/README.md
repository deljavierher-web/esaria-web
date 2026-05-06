# EsarIA — Sistema de Prospección Comercial

Sistema local para buscar, analizar y organizar potenciales clientes de EsarIA en Valladolid.

---

## Estructura

```
prospecting/
├── README.md                  ← este archivo
├── leads/
│   ├── leads.json             ← base de datos principal de leads
│   ├── leads.csv              ← versión CSV para importar/exportar
│   └── ejemplos/              ← leads de ejemplo para probar
├── app/
│   ├── index.html             ← mini CRM local (abrir en navegador)
│   ├── style.css
│   └── app.js
├── scripts/
│   ├── importar-leads.py      ← importar desde CSV o JSON externo
│   ├── analizar-leads.py      ← añadir análisis automático por sector
│   └── exportar-pdf.py        ← generar PDF del guion de llamada
├── pdf/
│   ├── guion-llamada-frio-esaria.html   ← guion visual completo
│   └── guion-llamada-frio-esaria.pdf    ← PDF para imprimir
└── templates/
    ├── lead-template.json               ← plantilla para nuevos leads
    ├── guion-sector-clinicas.md
    ├── guion-sector-talleres.md
    ├── guion-sector-gimnasios.md
    └── guion-sector-comercios.md
```

---

## Inicio rápido

### 1. Abrir el CRM local

```bash
open prospecting/app/index.html
```

La app carga los 5 leads de demo automáticamente.
Para usar tus propios leads, pulsa **Importar JSON** y selecciona `leads/leads.json`.

### 2. Analizar leads automáticamente

```bash
cd prospecting/scripts
python3 analizar-leads.py
```

Rellena `problema_visible`, `oportunidad_automatizacion` y los mensajes personalizados según el sector.

### 3. Ver el guion de llamada

```bash
open prospecting/pdf/guion-llamada-frio-esaria.html
```

### 4. Generar el PDF

```bash
cd prospecting/scripts
python3 exportar-pdf.py
```

Si no hay dependencias instaladas, el script abre el HTML en el navegador y te indica cómo imprimir a PDF (Cmd+P → Guardar como PDF).

---

## Cómo usar este sistema para buscar leads reales

### Paso 1 — Buscar negocios por sector y ciudad

Búsquedas recomendadas en Google Maps, Instagram o directorios locales:

| Sector | Búsqueda en Google |
|---|---|
| Clínica dental | `clínicas dentales Valladolid` |
| Fisioterapia | `centros de fisioterapia Valladolid` |
| Oftalmología | `clínicas oftalmológicas Valladolid` |
| Taller mecánico | `talleres mecánicos Valladolid` |
| Gimnasio | `gimnasios Valladolid` |
| Entrenador personal | `entrenador personal Valladolid` |
| Academia | `academias Valladolid` |
| Clínica dental | `dentistas Valladolid zona sur` |

Fuentes complementarias:
- Google Maps → buscar sector + ciudad → revisar ficha
- Instagram → buscar hashtag `#valladolid` + sector
- Páginas Amarillas → filtrar por sector y localidad
- LinkedIn → buscar empresa + Valladolid

### Paso 2 — Revisar web y redes manualmente

Para cada negocio, en 2-3 minutos:

- ¿Cómo gestionan las citas? (teléfono, WhatsApp, web, formulario)
- ¿Tienen respuesta automática en WhatsApp o Instagram?
- ¿Qué dice la gente en reseñas de Google Maps?
- ¿Hay un decisor identificable? (propietario, director, gerente)

### Paso 3 — Guardar datos públicos en leads.json

Copia `templates/lead-template.json`, rellena los campos con datos públicos y añádelo a `leads/leads.json`.

Campos obligatorios:
- `nombre_empresa`
- `sector`
- `ciudad`
- `telefono` (si está publicado)
- `fuente_datos` (de dónde sacaste el dato: Google Maps, web, Instagram...)

### Paso 4 — Analizar con el script

```bash
cd prospecting/scripts
python3 analizar-leads.py
```

Esto rellena automáticamente el problema detectado, la oportunidad de automatización y los mensajes personalizados según el sector.

### Paso 5 — Abrir la app local

```bash
open prospecting/app/index.html
```

Importa el `leads.json` actualizado. Filtra por prioridad o sector. Elige a quién llamar.

### Paso 6 — Llamar usando el guion

Abre el PDF o el HTML del guion:

```bash
open prospecting/pdf/guion-llamada-frio-esaria.html
```

Antes de llamar:
1. Identifica al decisor (propietario, director, gerente)
2. Detecta el problema concreto (revisa la web, reseñas, redes)
3. Prepara el mensaje personalizado (está en el lead)
4. Recuerda: el objetivo es agendar una reunión de 20 minutos, no vender por teléfono

### Paso 7 — Actualizar el estado del lead

Después de cada llamada, actualiza en la app:

| Estado | Cuándo usarlo |
|---|---|
| `Nuevo` | Lead identificado, aún no contactado |
| `Investigado` | Revisada web y redes, listo para llamar |
| `Llamado` | Llamada realizada, sin reunión aún |
| `Reunión agendada` | Reunión confirmada |
| `Descartado` | No interesado o pide no contactar |

---

## Flujo recomendado de trabajo semanal

```
Lunes:
  → Buscar 5-10 nuevos negocios en Google Maps/Instagram
  → Guardar en leads.json con fuente_datos

Martes-Jueves (10:00-12:00 o 16:00-18:00):
  → Llamar a los leads con prioridad Alta
  → Actualizar estado tras cada llamada
  → Enviar WhatsApp de seguimiento si no contestan

Viernes:
  → Revisar pipeline: ¿quién tiene reunión agendada?
  → Preparar diagnóstico para las reuniones de la semana siguiente
  → Añadir notas a los leads contactados
```

---

## Seguridad y legalidad (RGPD)

- Usar **solo datos públicos**: web corporativa, Google Maps, Instagram público, directorios oficiales.
- No hacer spam masivo ni enviar mensajes automáticos sin revisión humana.
- No contactar a empresas que hayan pedido expresamente no ser contactadas.
- Guardar siempre la fuente de cada dato (`fuente_datos` en el lead).
- Si alguien pide no volver a contactar, marcar como `Descartado` y añadir nota.
- No guardar datos personales sensibles (DNI, datos de salud, cuentas bancarias).
- Este sistema es una herramienta de preparación, no de contacto automático.

---

## Buscar leads reales automáticamente

Los leads reales se guardan en `leads/reales/` y **nunca se suben a GitHub** (ignorado por `.gitignore`).

Hay tres modos de trabajo según los recursos disponibles:

---

### MODO A — Manual/seguro (sin dependencias)

Busca manualmente en Google Maps, Instagram o directorios y copia los datos públicos en un CSV:

```
nombre_empresa,sector,ciudad,telefono,web,direccion,fuente_datos
Clínica Dental Sol,Clínica dental,Valladolid,983 111 222,https://...,Calle Mayor 5,Google Maps — búsqueda manual — 2025-05-06
```

Importa con:

```bash
python3 scripts/importar-leads.py mi_archivo.csv leads/reales/leads-reales.json
python3 scripts/enriquecer-leads.py
open app/index.html
```

---

### MODO B — Semi-automático (abre búsquedas preparadas)

El script abre Google Maps con las búsquedas correctas y te da instrucciones para copiar/pegar resultados:

```bash
# Buscar y abrir búsquedas en el navegador
python3 scripts/buscar-leads.py --sector "clínicas dentales" --ciudad "Valladolid" --limite 20
python3 scripts/buscar-leads.py --sector "talleres mecánicos" --ciudad "Valladolid" --limite 20
python3 scripts/buscar-leads.py --sector "gimnasios" --ciudad "Valladolid" --limite 20
python3 scripts/buscar-leads.py --sector "fisioterapia" --ciudad "Valladolid" --limite 20

# Enriquecer con análisis comercial
python3 scripts/enriquecer-leads.py

# Abrir app e importar leads reales
open app/index.html
```

---

### MODO C — Automático con Google Places API

Si tienes una clave de Google Places API, el script la detecta automáticamente desde `.env`:

```bash
# Añadir al archivo .env (ya ignorado por Git):
GOOGLE_PLACES_API_KEY=tu_clave_aqui
```

Luego ejecuta exactamente igual que el Modo B:

```bash
python3 scripts/buscar-leads.py --sector "clínicas dentales" --ciudad "Valladolid" --limite 20
python3 scripts/fusionar-leads.py leads/reales/batch-FECHA.json
python3 scripts/enriquecer-leads.py
open app/index.html
```

La clave es gratuita hasta ciertos límites en [Google Cloud Console](https://console.cloud.google.com/) (habilita "Places API").

---

### Importar en la app

1. Abre la app: `open prospecting/app/index.html`
2. Pulsa el botón **"Importar leads reales"** (aparece en la barra de filtros)
3. Selecciona `prospecting/leads/reales/leads-reales.json`
4. Los leads reales reemplazan los DEMO en el navegador y se guardan en `localStorage`

---

## Enriquecer decisores automáticamente

El script `enriquecer-decisores.py` intenta localizar el posible decisor usando solo la web pública oficial de cada negocio. No entra en LinkedIn, Instagram, paneles privados, login, admin, checkout ni páginas protegidas.

Reglas importantes:

- No inventa nombres.
- Si no encuentra evidencia clara, deja el decisor como `No encontrado`.
- Guarda siempre `fuente_decisor` con la URL exacta revisada.
- Guarda `evidencia_decisor` con un fragmento corto del texto encontrado.
- Si hay varios nombres y no hay cargo claro, los guarda en `candidatos_decisor` y no elige aleatoriamente.

Niveles de confianza:

| Nivel | Criterio |
|---|---|
| `Alta` | Nombre + cargo claro en la misma zona de texto |
| `Media` | Nombre claro en página de equipo, pero cargo ambiguo |
| `Baja` | Candidatos encontrados sin evidencia suficiente para elegir |
| `No encontrado` | Sin evidencia suficiente o lead sin web |

Uso:

```bash
python3 prospecting/scripts/enriquecer-decisores.py
open prospecting/app/index.html
```

Después abre la app y pulsa **Importar leads reales** para seleccionar:

```bash
prospecting/leads/reales/leads-reales.json
```

---

## Scripts de referencia

```bash
# FASE 1 — Leads demo y análisis
python3 scripts/importar-leads.py mis_leads.csv leads/leads.json
python3 scripts/analizar-leads.py
python3 scripts/exportar-pdf.py

# FASE 2 — Leads reales
python3 scripts/buscar-leads.py --sector "clínicas dentales" --ciudad "Valladolid" --limite 20
python3 scripts/fusionar-leads.py leads/reales/batch-FECHA.json
python3 scripts/enriquecer-leads.py
python3 scripts/enriquecer-decisores.py
open app/index.html

# PDF del guion
python3 scripts/exportar-pdf.py
pip3 install weasyprint  # para generación automática
```

---

*EsarIA — Automatización útil para negocios reales*
