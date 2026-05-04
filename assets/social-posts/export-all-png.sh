#!/bin/bash
# EsarIA — Exportar todos los SVG a PNG
# Cada post se exporta en su propia carpeta exports/ para evitar nombres repetidos.

set -e

BASE="$(cd "$(dirname "$0")" && pwd)"
IG="$BASE/instagram"

echo "Exportando contenidos de Instagram a PNG..."
echo "Directorio base: $BASE"
echo ""

export_post_reel() {
  local post_dir="$1"
  local source_dir="$post_dir/source"
  local exports_dir="$post_dir/exports"
  mkdir -p "$exports_dir"
  local count=0
  for svg in "$source_dir"/frame-*.svg; do
    [ -f "$svg" ] || continue
    local name=$(basename "$svg" .svg)
    # -s 3840 fuerza suficiente resolución para respetar ratio 9:16 (1080x1920)
    qlmanage -t -s 3840 -o "$exports_dir" "$svg" 2>/dev/null || true
    if [ -f "$exports_dir/${name}.svg.png" ]; then
      mv "$exports_dir/${name}.svg.png" "$exports_dir/${name}.png"
    fi
    count=$((count + 1))
  done
  echo "  $(basename "$post_dir") (reel): $count frames exportados → $exports_dir"
  echo "  NOTA: si los PNG no tienen ratio 9:16, usa export-reel-png.sh o el navegador."
}

export_post() {
  local post_dir="$1"
  local source_dir="$post_dir/source"
  local exports_dir="$post_dir/exports"

  mkdir -p "$exports_dir"

  local count=0
  for svg in "$source_dir"/*.svg; do
    [ -f "$svg" ] || continue
    local name=$(basename "$svg" .svg)
    qlmanage -t -s 2160 -o "$exports_dir" "$svg" 2>/dev/null || true
    # qlmanage adds .svg.png — rename to .png
    if [ -f "$exports_dir/${name}.svg.png" ]; then
      mv "$exports_dir/${name}.svg.png" "$exports_dir/${name}.png"
    fi
    count=$((count + 1))
  done

  echo "  $(basename "$post_dir"): $count archivos exportados → $exports_dir"
}

export_post "$IG/post-01-presentacion-esaria"
export_post "$IG/post-02-citas-manuales"
export_post "$IG/post-03-4-tareas"
export_post "$IG/post-04-que-es-automatizar"
# Reel: usar tamaño mayor para preservar ratio 9:16 con qlmanage
export_post_reel "$IG/post-05-bucle-whatsapp-reel"
export_post "$IG/post-06-ejemplo-clinica"
export_post "$IG/stories-destacadas"

echo ""
echo "Exportación completada."
echo "Los PNG están en la carpeta exports/ de cada post."
