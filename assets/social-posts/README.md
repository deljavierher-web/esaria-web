# EsarIA — Contenidos para Instagram

Recursos de diseño para los primeros 6 publicaciones en Instagram de EsarIA.
Todos los archivos son SVG escalables, listos para exportar a PNG.

> Estos contenidos son iniciales. No incluyen casos reales de clientes ni métricas verificadas.
> Todos los ejemplos están marcados como hipotéticos o ilustrativos.

---

## Estructura de carpetas

Cada post tiene su propia carpeta dentro de `instagram/`, con la siguiente estructura:

```
instagram/
  post-XX-nombre/
    source/        ← archivos SVG originales (no modificar)
    exports/       ← PNGs exportados (se generan con export-all-png.sh)
    caption.txt    ← texto de la publicación
    preview.html   ← vista previa en navegador (abre directamente en Safari/Chrome)
    README.md      ← solo en post-05 (instrucciones de montaje del reel)
  stories-destacadas/
    source/        ← las 3 stories en SVG
    exports/
    preview.html
  previews/
    master-preview.html  ← vista general de todos los posts
```

---

## Posts

| Carpeta | Formato | Slides / Frames | Caption |
|---------|---------|-----------------|---------|
| `post-01-presentacion-esaria/` | Imagen única | 1 | `caption.txt` |
| `post-02-citas-manuales/` | Carrusel | 7 slides | `caption.txt` |
| `post-03-4-tareas/` | Carrusel | 6 slides | `caption.txt` |
| `post-04-que-es-automatizar/` | Carrusel | 8 slides | `caption.txt` |
| `post-05-bucle-whatsapp-reel/` | Reel | 8 frames (~21s) | `caption.txt` |
| `post-06-ejemplo-clinica/` | Carrusel | 7 slides | `caption.txt` |
| `stories-destacadas/` | Stories | 3 stories | — |

Los captions se mantienen dentro de cada carpeta de post como `caption.txt`.

---

## Orden de publicación sugerido

| Día | Contenido | Formato | Objetivo |
|-----|-----------|---------|----------|
| Día 1 | Post 1 — Presentación | Imagen única | Dar a conocer la marca |
| Día 1 | Stories 1, 2 y 3 | Stories destacadas | Perfil completo desde el inicio |
| Día 3 | Post 3 — 4 tareas | Carrusel | Guardados y educación |
| Día 5 | Post 5 — Reel WhatsApp | Reel | Alcance a nuevos seguidores |
| Día 7 | Post 2 — Citas manuales | Carrusel | Identificación y comentarios |
| Día 10 | Post 4 — Qué es automatizar | Carrusel | Confianza y guardados |
| Día 13 | Post 6 — Ejemplo clínica | Carrusel | Leads por DM |

---

## Cómo abrir el master preview

```bash
bash assets/social-posts/open-previews.sh
```

O directamente:
```bash
open "assets/social-posts/instagram/previews/master-preview.html"
```

---

## Cómo exportar todos los SVG a PNG

```bash
bash assets/social-posts/export-all-png.sh
```

Esto genera PNGs en la carpeta `exports/` de **cada post por separado**. Esto es importante:
- Evita colisiones de nombres (varios posts tienen un archivo llamado `01-hook.svg`)
- Cada post queda listo para subir de forma independiente

**ADVERTENCIA: no exportes todos los SVG a una carpeta compartida** — habrá sobreescrituras silenciosas porque muchos slides tienen el mismo nombre (01-hook.svg, 07-cta.svg, etc.).

Los PNGs exportados estarán en:
```
instagram/post-01-presentacion-esaria/exports/
instagram/post-02-citas-manuales/exports/
instagram/post-03-4-tareas/exports/
instagram/post-04-que-es-automatizar/exports/
instagram/post-05-bucle-whatsapp-reel/exports/
instagram/post-06-ejemplo-clinica/exports/
instagram/stories-destacadas/exports/
```

---

## Exportar un post concreto manualmente

```bash
# Exportar solo el Post 02 (carrusel de citas)
BASE="assets/social-posts/instagram/post-02-citas-manuales"
for svg in "$BASE/source"/*.svg; do
  name=$(basename "$svg" .svg)
  qlmanage -t -s 2160 -o "$BASE/exports" "$svg" 2>/dev/null
  [ -f "$BASE/exports/${name}.svg.png" ] && mv "$BASE/exports/${name}.svg.png" "$BASE/exports/${name}.png"
done
```

### Alternativa con Inkscape (si está instalado)

```bash
inkscape --export-png="exports/post-01.png" --export-dpi=144 \
  "assets/social-posts/instagram/post-01-presentacion-esaria/source/post-01-presentacion-esaria.svg"
```

---

## Antes de publicar — revisión obligatoria

- [ ] **No hay referencias a esaria.es** — solo "escríbenos por DM"
- [ ] **No hay afirmaciones de clientes reales** — todos los ejemplos son hipotéticos
- [ ] **Las métricas ilustrativas están marcadas** — "(ejemplo ilustrativo)", "(hipotético)"
- [ ] **El texto se lee bien en móvil** — exporta y revisa en pantalla pequeña
- [ ] **Los captions están revisados** — no copiar y pegar sin leer
- [ ] **Las historias están guardadas como destacadas** — publicar stories 1, 2 y 3 el día 1

---

## Paleta de colores

| Color | Hex | Uso |
|-------|-----|-----|
| Azul oscuro | `#0F172A` | Fondo oscuro, texto sobre claro |
| Acento morado | `#6D5EF3` | Énfasis, bordes, CTA |
| Fondo claro | `#F8FAFC` | Fondo slides claros |
| Texto cuerpo | `#334155` | Texto principal en slides claros |
| Texto muted | `#64748B` | Texto secundario, notas |
| Verde suave | `#DCFCE7` / `#22C55E` | Elementos "SÍ" / positivos |
| Rojo suave | `#FEE2E2` / `#DC2626` | Elementos "NO" / negativos |

---

## Tipografía

Inter (sans-serif) — la misma que usa la web de EsarIA.
Los SVG incluyen fallback: `font-family="Inter, -apple-system, BlinkMacSystemFont, Arial, sans-serif"`

Para que Inter se vea correctamente al exportar, asegúrate de tener la fuente instalada en el sistema o usa una herramienta de exportación que incluya fuentes web.
