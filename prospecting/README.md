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

## Scripts de referencia

```bash
# Importar leads desde CSV externo
python3 scripts/importar-leads.py mis_leads.csv leads/leads.json

# Analizar todos los leads y rellenar campos vacíos
python3 scripts/analizar-leads.py

# Generar PDF del guion
python3 scripts/exportar-pdf.py

# Instalar weasyprint para generación automática de PDF
pip3 install weasyprint
```

---

*EsarIA — Automatización útil para negocios reales*
