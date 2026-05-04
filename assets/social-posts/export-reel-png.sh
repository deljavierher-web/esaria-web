#!/bin/bash
# EsarIA — Exportar frames del Reel a PNG en formato 9:16 (1080×1920)
#
# Los frames SVG son verticales (1080×1920). qlmanage en macOS puede
# producir thumbnails con ratio incorrecto para SVG no cuadrados.
# Este script usa el método más fiable disponible en el sistema.
#
# Métodos disponibles (por orden de fiabilidad):
#   1. rsvg-convert  → ratio exacto garantizado  (brew install librsvg)
#   2. qlmanage      → disponible en macOS, resultado puede variar
#   3. Navegador     → ver instrucciones manuales al final del script

set -e

BASE="$(cd "$(dirname "$0")" && pwd)"
REEL_DIR="$BASE/instagram/post-05-bucle-whatsapp-reel"
SOURCE="$REEL_DIR/source"
EXPORTS="$REEL_DIR/exports"

mkdir -p "$EXPORTS"

echo "================================================"
echo " EsarIA — Exportar Reel frames a PNG"
echo " Origen:  $SOURCE"
echo " Destino: $EXPORTS"
echo "================================================"
echo ""

# ── MÉTODO 1: rsvg-convert (más fiable, requiere librsvg) ──────────────────
if command -v rsvg-convert &>/dev/null; then
  echo "Usando rsvg-convert (ratio garantizado 1080×1920)..."
  for svg in "$SOURCE"/frame-*.svg; do
    [ -f "$svg" ] || continue
    name=$(basename "$svg" .svg)
    rsvg-convert -w 1080 -h 1920 "$svg" -o "$EXPORTS/${name}.png"
    echo "  ✓ ${name}.png"
  done
  echo ""
  echo "Exportación completada con rsvg-convert."
  echo "PNGs en: $EXPORTS"
  exit 0
fi

# ── MÉTODO 2: qlmanage (macOS nativo, ratio aproximado) ───────────────────
echo "rsvg-convert no encontrado. Usando qlmanage..."
echo "AVISO: qlmanage puede no respetar exactamente el ratio 9:16."
echo "Si los PNG salen cuadrados, usa el método del navegador (ver abajo)."
echo ""

for svg in "$SOURCE"/frame-*.svg; do
  [ -f "$svg" ] || continue
  name=$(basename "$svg" .svg)
  # -s 3840 = doble de la dimension mayor (1920×2 = 3840) para preservar ratio
  qlmanage -t -s 3840 -o "$EXPORTS" "$svg" 2>/dev/null || true
  if [ -f "$EXPORTS/${name}.svg.png" ]; then
    mv "$EXPORTS/${name}.svg.png" "$EXPORTS/${name}.png"
    echo "  ✓ ${name}.png"
  else
    echo "  ✗ ${name} — no se generó output (revisa permisos)"
  fi
done

echo ""
echo "Exportación con qlmanage completada."
echo "PNGs en: $EXPORTS"
echo ""
echo "================================================"
echo " VERIFICAR DIMENSIONES"
echo "================================================"
echo "Ejecuta esto para comprobar que los PNG son 1080×1920:"
echo ""
echo '  for f in '"$EXPORTS"'/*.png; do'
echo '    echo "$(basename $f): $(sips -g pixelWidth -g pixelHeight "$f" | grep pixel)"'
echo '  done'
echo ""
echo "================================================"
echo " MÉTODO ALTERNATIVO — NAVEGADOR (sin instalación)"
echo "================================================"
echo ""
echo "Si qlmanage produce PNGs cuadrados o con ratio incorrecto:"
echo ""
echo "1. Abre en Safari (recomendado) o Chrome:"
echo "   open -a Safari '$SOURCE/frame-01.svg'"
echo ""
echo "2. En el menú: Archivo > Exportar como PDF"
echo "   (guarda el PDF junto al SVG)"
echo ""
echo "3. Abre el PDF en Preview.app y expórtalo como PNG:"
echo "   Archivo > Exportar... > Formato: PNG > Resolución: 144 ppp"
echo ""
echo "4. Repite para cada frame (frame-01 a frame-08)."
echo ""
echo "O instala rsvg-convert para exportación automática exacta:"
echo "   brew install librsvg"
echo "   bash export-reel-png.sh"
