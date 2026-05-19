# EsarIA — Sistema de diseño

Marca local de **automatización e IA práctica para pequeñas empresas de Valladolid**.

Tono visual: **profesional, sobrio, B2B limpio, minimalista**. Nada de cyberpunk, robots, gradientes neón, glassmorphism agresivo, cerebros, bombillas ni circuitos exagerados.

Referencias visuales válidas: **Linear, Attio, Folk, Pipedrive moderno, Notion, Vercel dashboard, Stripe Dashboard**.

---

## Logos

En `/logos/`:

- `esaria-logo-horizontal.svg` — logo principal (fondo claro)
- `esaria-logo-horizontal-dark.svg` — para fondos oscuros
- `esaria-logo-horizontal-light.svg` — variante light
- `esaria-wordmark.svg` — solo wordmark
- `esaria-wordmark-mono.svg` — monocromo

**Uso por defecto:** `esaria-logo-horizontal.svg` en header sobre fondo dark `#0F172A`.

## Iconos / Símbolo de marca

En `/iconos/`:

- `esaria-icon.svg` — símbolo principal
- `esaria-icon-dark.svg` — sobre fondos claros
- `esaria-icon-light.svg` — sobre fondos oscuros
- `esaria-icon-mono.svg` — monocromo
- `favicon.svg` — favicon

---

## Paleta de colores

### Neutros (estructura)

| Token | Hex | Uso |
|---|---|---|
| `dark` | `#0F172A` | Header, texto fuerte, dark mode |
| `text` | `#1E293B` | Texto principal |
| `subtle` | `#64748B` | Texto secundario, labels |
| `border` | `#E2E8F0` | Bordes, separadores |
| `bg` | `#F8FAFC` | Fondo de página |
| `white` | `#FFFFFF` | Cards, inputs |

### Acento

| Token | Hex | Uso |
|---|---|---|
| `accent` | `#6366F1` | Indigo-500. Botón primario, focus ring, links |
| `accent-hover` | `#4F46E5` | Hover de acento |

### Estados semánticos (badges pill: texto sobre fondo pastel)

| Concepto | Texto | Fondo |
|---|---|---|
| Alta prioridad / error | `#DC2626` | `#FEF2F2` |
| Llamado / aviso | `#D97706` | `#FFFBEB` |
| Reunión / éxito | `#16A34A` | `#F0FDF4` |
| Nuevo / info | `#2563EB` | `#EFF6FF` |
| Investigado | `#7C3AED` | `#F5F3FF` |
| Descartado / neutral | `#64748B` | `#F1F5F9` |
| Sector | `#1D4ED8` | `#EFF6FF` |
| Tag custom | `#059669` | `#ECFDF5` |

---

## Tipografía

**Familia primaria:** Inter (Google Fonts).
**Fallback:** system-ui, -apple-system, "Segoe UI", sans-serif.

**Pesos disponibles:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold).

### Escala

| Token | Tamaño | Peso | Uso |
|---|---|---|---|
| `display` | 20 px | 700 | Nombre empresa en modal |
| `h1` | 18 px | 700 | Brand name, títulos principales |
| `h2` | 15 px | 700 | Card title |
| `body` | 14 px | 400 | Texto general |
| `small` | 13 px | 400 | Texto en cards, inputs |
| `meta` | 12 px | 400 | Meta info, fechas |
| `label` | 11 px | 600 | Labels de campo, badges (uppercase) |

### Letter spacing

- Labels uppercase: `0.4–0.6 px`
- Headings: `-0.3 px`
- Body: normal

---

## Espaciado y radios

- **Bordes:** `8 px` (estándar), `10 px` (cards), `12 px` (modal), `20 px` (badges pill)
- **Padding interno cards:** `16 px`
- **Padding interno modal:** `28 px`
- **Gap entre cards:** `16 px`
- **Sombra suave:** `0 1px 4px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.06)`
- **Sombra modal:** `0 8px 32px rgba(0,0,0,.18)`

---

## Elementos UI clave

### Botones

- **Primary:** fondo `accent`, texto `white`, padding `7px 13px`, radius `8px`.
- **Secondary:** fondo `white`, texto `text`, borde `border`. Hover: borde `accent`, texto `accent`.
- **Ghost:** fondo transparente, texto `subtle`, borde `border`. Tamaño pequeño.
- **Small:** padding `4px 10px`, font 12 px.

### Inputs

- Borde `border`, radius `8px`, padding `7px 12px`, fondo `bg`.
- Focus: borde `accent`, sin glow agresivo.

### Badges (pill)

- Radius `20px`, padding `2px 8px`, font 11 px, peso 600.
- Texto + fondo según tabla de estados semánticos.

### Cards

- Fondo `white`, borde `border`, radius `10px`, padding `16px`, sombra suave.
- Hover: sombra más marcada + borde gris medio.

### Modal

- Overlay: `rgba(15, 23, 42, .55)`.
- Card: fondo `white`, radius `12px`, max-width `680px`, padding `28px`.

---

## Tono de contenido (importante para los placeholders)

EsarIA aún **no tiene clientes reales**. En el mockup:

✅ **Sí:** "diagnóstico inicial", "automatización útil", "tareas repetitivas", "negocios locales", nombres de pymes plausibles, problemas reales (citas manuales, recordatorios por WhatsApp, gestión de socios).

❌ **No:** métricas inventadas (+245%, "AI Insights", "1.2M usuarios"), "somos líderes", "revolucionamos tu negocio", logos de clientes, testimoniales falsos.

---

## Densidad e interacción

- Densidad informativa al estilo Linear/Attio: ver mucha info de un vistazo sin agobiar.
- Hover sutil en cards (sombra ligera + borde más oscuro).
- Focus visible pero discreto.
- Header y barra de filtros **sticky**.
- Sin animaciones largas. Transiciones `.15s` máximo.
- Sin modo oscuro (light mode impecable primero).
