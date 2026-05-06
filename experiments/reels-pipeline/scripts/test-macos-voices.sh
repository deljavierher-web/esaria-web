#!/usr/bin/env bash
# test-macos-voices.sh
# Genera muestras WAV de todas las voces españolas disponibles en macOS say.
# Uso: bash scripts/test-macos-voices.sh
# Salida: output/voice-tests/voice-*.wav
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
OUT_DIR="$BASE_DIR/output/voice-tests"
mkdir -p "$OUT_DIR"

TEXTO="Hola, soy EsarIA. Automatizamos tareas repetitivas para pequeñas empresas de Valladolid."

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Muestras de voz — EsarIA Reel Pipeline"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Texto: $TEXTO"
echo ""

generate() {
  local key="$1"
  local voice="$2"
  local aiff="$OUT_DIR/voice-${key}.aiff"
  local wav="$OUT_DIR/voice-${key}.wav"

  printf "  %-32s → " "$voice"

  if say -v "$voice" -o "$aiff" "$TEXTO" 2>/dev/null; then
    ffmpeg -y -i "$aiff" -ar 44100 -ac 1 -c:a pcm_s16le "$wav" 2>/dev/null
    rm -f "$aiff"
    SIZE=$(du -sh "$wav" | cut -f1)
    echo "✓ voice-${key}.wav  ($SIZE)"
  else
    echo "✗ no disponible o no descargada"
    rm -f "$aiff" 2>/dev/null || true
  fi
}

echo "[es_ES — España]"
generate "reed-eses"    "Reed (Español (España))"
generate "sandy-eses"   "Sandy (Español (España))"
generate "shelley-eses" "Shelley (Español (España))"
generate "flo-eses"     "Flo (Español (España))"
generate "eddy-eses"    "Eddy (Español (España))"
generate "rocko-eses"   "Rocko (Español (España))"
generate "monica"       "Mónica"

echo ""
echo "[es_MX — México]"
generate "reed-esmx"    "Reed (Español (México))"
generate "sandy-esmx"   "Sandy (Español (México))"
generate "shelley-esmx" "Shelley (Español (México))"
generate "flo-esmx"     "Flo (Español (México))"
generate "eddy-esmx"    "Eddy (Español (México))"
generate "rocko-esmx"   "Rocko (Español (México))"
generate "paulina"      "Paulina"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Para escuchar (Finder): open \"$OUT_DIR\""
echo ""
echo "Para escuchar por terminal:"
FOUND=false
for f in "$OUT_DIR"/voice-*.wav; do
  [ -f "$f" ] || continue
  if ! $FOUND; then
    echo "  afplay \"$f\""
    FOUND=true
  fi
done
echo ""
echo "Para escucharlas todas en secuencia:"
echo "  for f in \"$OUT_DIR\"/voice-*.wav; do"
echo "    echo \"▶ \$f\"; afplay \"\$f\"; done"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
