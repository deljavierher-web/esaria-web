#!/bin/bash
# EsarIA — Abrir previews en el navegador

BASE="$(cd "$(dirname "$0")" && pwd)"
IG="$BASE/instagram"

echo "Abriendo previews de EsarIA Instagram..."

# Abrir master preview
open "$IG/previews/master-preview.html"

# Opcional: abrir previews individuales (descomentar si necesitas)
# open "$IG/post-01-presentacion-esaria/preview.html"
# open "$IG/post-02-citas-manuales/preview.html"
# open "$IG/post-03-4-tareas/preview.html"
# open "$IG/post-04-que-es-automatizar/preview.html"
# open "$IG/post-05-bucle-whatsapp-reel/preview.html"
# open "$IG/post-06-ejemplo-clinica/preview.html"
# open "$IG/stories-destacadas/preview.html"

echo "Listo."
