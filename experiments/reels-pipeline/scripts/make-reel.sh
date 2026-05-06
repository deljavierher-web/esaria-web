#!/usr/bin/env bash
# make-reel.sh — pipeline completo: voz → render → compose → output/reel-demo.mp4
#
# Variables de entorno:
#   TTS_ENGINE=macos|kokoro|piper|auto   (default: auto)
#   MACOS_VOICE="Reed (Español (España))"  (default para motor macos)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"

cd "$BASE_DIR"

mkdir -p tmp output

TTS_ENGINE="${TTS_ENGINE:-auto}"
MACOS_VOICE="${MACOS_VOICE:-Reed (Español (España))}"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   EsarIA Reels Pipeline                  ║"
echo "║   TTS_ENGINE=${TTS_ENGINE}$(printf '%*s' $((22-${#TTS_ENGINE})) '')║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── Paso 1: Generar voz ──────────────────────────────────────────────────────
echo "=== [1/4] Generando voz (TTS) ==="
# Seleccionar el python correcto: .venv312 para kokoro, sistema para el resto
if [ "$TTS_ENGINE" = "kokoro" ] && [ -f ".venv312/bin/python" ]; then
  TTS_ENGINE="$TTS_ENGINE" MACOS_VOICE="$MACOS_VOICE" .venv312/bin/python scripts/make-voice.py
elif [ -f ".venv/bin/python" ]; then
  TTS_ENGINE="$TTS_ENGINE" MACOS_VOICE="$MACOS_VOICE" .venv/bin/python scripts/make-voice.py
else
  TTS_ENGINE="$TTS_ENGINE" MACOS_VOICE="$MACOS_VOICE" python3 scripts/make-voice.py
fi
echo ""

# ── Paso 2: Generar HTML con timings adaptados al audio ──────────────────────
echo "=== [2/4] Generando HTML con timings sincronizados ==="
node scripts/build-timed-html.js
echo ""

# ── Paso 3: Renderizar animación ─────────────────────────────────────────────
echo "=== [3/4] Renderizando animación HTML ==="
node scripts/render-video.js
echo ""

# ── Paso 4: Componer vídeo final ─────────────────────────────────────────────
echo "=== [4/4] Componiendo vídeo final ==="
bash scripts/compose-video.sh
echo ""

# ── Resultado ────────────────────────────────────────────────────────────────
MP4="$BASE_DIR/output/reel-demo.mp4"
if [ -f "$MP4" ]; then
  echo "✅ Reel generado:"
  ls -lh "$MP4"
  echo ""
  echo "Para previsualizar: open \"$MP4\""
else
  echo "❌ No se generó el MP4. Revisa los errores anteriores."
  exit 1
fi
