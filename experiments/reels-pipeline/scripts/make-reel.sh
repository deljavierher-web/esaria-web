#!/usr/bin/env bash
# make-reel.sh — pipeline completo: voz → render → compose → output/ + Drive
#
# Variables de entorno:
#   TTS_ENGINE=macos|kokoro|piper|gemini|auto   (default: auto)
#   MACOS_VOICE="Reed (Español (España))"       (default para motor macos)
#   REEL_SLUG=nombre-del-reel                   (default: esaria)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
PROJ_DIR="$(dirname "$(dirname "$BASE_DIR")")"

cd "$BASE_DIR"

mkdir -p tmp output

TTS_ENGINE="${TTS_ENGINE:-auto}"
MACOS_VOICE="${MACOS_VOICE:-Reed (Español (España))}"
REEL_SLUG="${REEL_SLUG:-esaria}"
TIMESTAMP="$(date +%Y-%m-%d-%H%M)"

DRIVE_FINALES="$PROJ_DIR/contenido/reels/finales"
DRIVE_AUDIOS="$PROJ_DIR/contenido/reels/audios"
mkdir -p "$DRIVE_FINALES" "$DRIVE_AUDIOS"

FINAL_NAME="reel-${REEL_SLUG}-${TIMESTAMP}.mp4"
AUDIO_NAME="audio-${REEL_SLUG}-${TIMESTAMP}.wav"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   EsarIA Reels Pipeline                  ║"
echo "║   TTS_ENGINE=${TTS_ENGINE}$(printf '%*s' $((22-${#TTS_ENGINE})) '')║"
echo "║   SLUG=${REEL_SLUG}$(printf '%*s' $((27-${#REEL_SLUG})) '')║"
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
WAV="$BASE_DIR/tmp/voice.wav"

if [ ! -f "$MP4" ]; then
  echo "❌ No se generó el MP4. Revisa los errores anteriores."
  exit 1
fi

echo "✅ Reel generado:"
ls -lh "$MP4"
echo ""

# ── Copiar a Drive ────────────────────────────────────────────────────────────
DRIVE_MP4="$DRIVE_FINALES/$FINAL_NAME"
cp "$MP4" "$DRIVE_MP4"
echo "📁 Copia en Drive:"
ls -lh "$DRIVE_MP4"

if [ -f "$WAV" ]; then
  DRIVE_WAV="$DRIVE_AUDIOS/$AUDIO_NAME"
  cp "$WAV" "$DRIVE_WAV"
  echo "🔊 Audio en Drive:"
  ls -lh "$DRIVE_WAV"
fi

echo ""
echo "Para previsualizar: open \"$DRIVE_MP4\""
