# EsarIA — Brand Assets

## Marca

**Nombre:** EsarIA  
**Sector:** Automatización e inteligencia artificial práctica para pequeñas empresas  
**Localización:** Valladolid, España

## Posicionamiento

EsarIA no vende "IA" como humo. Ayuda a negocios reales a ahorrar tiempo, ordenar procesos y automatizar tareas repetitivas de forma sencilla y práctica.

## Personalidad de marca

Profesional · Minimalista · Moderna · Cercana · Confiable · Clara

---

## Colores

| Nombre         | HEX       | Uso                                      |
|----------------|-----------|------------------------------------------|
| Primary Dark   | `#0F172A` | Texto principal, barras del isotipo      |
| Dark Alt       | `#111827` | Fondos oscuros alternativos              |
| Accent Purple  | `#6D5EF3` | Letras "IA", nodo del isotipo, CTAs      |
| Accent Blue    | `#5B7CFA` | Alternativa al púrpura en elementos UI  |
| White          | `#FFFFFF` | Fondos claros, texto sobre oscuro        |
| Background     | `#F8FAFC` | Fondo base de la web                     |

---

## Tipografía

**Principal:** Inter (Google Fonts, pesos 400 · 600 · 700 · 800)  
**Alternativa:** Manrope  
**Fallback sistema:** -apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif

---

## Archivos generados

### Isotipo / Icono

| Archivo                        | Uso                                |
|--------------------------------|------------------------------------|
| `icon/esaria-icon.svg`         | Isotipo estándar (fondo claro)     |
| `icon/esaria-icon-dark.svg`    | Isotipo para fondos oscuros        |
| `icon/esaria-icon-light.svg`   | Isotipo con fondo blanco explícito |
| `icon/esaria-icon-mono.svg`    | Isotipo monocromo (impresión)      |

### Logo horizontal

| Archivo                                   | Uso                                     |
|-------------------------------------------|-----------------------------------------|
| `logo/esaria-logo-horizontal.svg`         | Logo principal — web, documentos        |
| `logo/esaria-logo-horizontal-dark.svg`    | Logo sobre fondos oscuros               |
| `logo/esaria-logo-horizontal-light.svg`   | Logo con fondo blanco (para compartir)  |
| `logo/esaria-wordmark.svg`                | Solo el texto, con acento en "IA"       |
| `logo/esaria-wordmark-mono.svg`           | Texto completo en un solo color         |

### Favicon

| Archivo                      | Uso                                |
|------------------------------|------------------------------------|
| `favicon/favicon.svg`        | Favicon SVG para navegadores       |

### Redes sociales

| Archivo                               | Dimensiones    | Uso                                 |
|---------------------------------------|----------------|-------------------------------------|
| `social/esaria-profile-square.svg`    | 800×800 vBox   | Twitter, Facebook, LinkedIn         |
| `social/esaria-profile-circle-safe.svg` | 800×800 vBox | Perfiles con recorte circular       |
| `social/esaria-instagram-profile.svg` | 800×800 vBox   | Foto de perfil Instagram            |
| `social/esaria-cover-horizontal.svg`  | 1500×500 vBox  | Portada general (Facebook, etc.)    |
| `social/esaria-linkedin-banner.svg`   | 1584×396 vBox  | Banner de LinkedIn                  |

### Previews

| Archivo                          | Descripción                                 |
|----------------------------------|---------------------------------------------|
| `previews/logo-preview.html`     | Todas las variantes del logo                |
| `previews/social-preview.html`   | Versiones para redes sociales               |
| `previews/brand-board.html`      | Brand board completo con paleta y tipografía|

---

## Cuándo usar cada variante

- **Logo horizontal** → Header web, documentos, presentaciones, facturas
- **Logo horizontal oscuro** → Fondos navy/oscuros (footer, banners)
- **Wordmark solo** → Espacios de altura reducida
- **Isotipo solo** → Favicon, foto de perfil, app icon
- **Monocromo** → Documentos impresos B/N, sellos, bordados
- **Redes sociales** → Usar el archivo específico de cada red

---

## Reglas básicas de uso

**Hacer:**
- Mantener las proporciones originales del logo
- Respetar un margen mínimo igual a la altura de la "E" alrededor del logo
- Usar siempre sobre fondos con contraste suficiente
- Usar el isotipo para favicon y avatares pequeños

**Evitar:**
- Deformar, estirar o rotar el logo
- Cambiar los colores sin criterio de marca
- Usar sobre fondos con poco contraste
- Añadir sombras, efectos 3D, resplandores o degradados extras
- Recrear el logo con otra tipografía

---

## Historial de correcciones

| Fecha | Archivo | Corrección |
|-------|---------|------------|
| 2026-05-02 | `social/esaria-instagram-profile.svg` | Centrado del isotipo corregido: `translate(220,220)` → `translate(240,240)`. El centro visual del isotipo (20,20 en coords 40×40) ahora cae exactamente en (400,400) del canvas 800×800. Los demás perfiles ya estaban correctamente centrados. |

---

## Nota sobre fuentes en SVG

Los SVG usan `@import` de Google Fonts (Inter 800). En navegadores modernos la fuente se carga correctamente. Si los SVG se usan como archivos adjuntos (email, Figma import), puede que rendericen con la fuente del sistema — el resultado sigue siendo profesional gracias al fallback definido.

Para exportar a PNG con fuente perfecta, abrir el SVG en navegador y hacer screenshot, o usar una herramienta como Inkscape o Figma con Inter instalado.
