#!/usr/bin/env bash
# compose-video.sh — combina tmp/video.mp4 + tmp/voice.wav → output/reel-demo.mp4
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"

VIDEO_IN="$BASE_DIR/tmp/video.mp4"
AUDIO_IN="$BASE_DIR/tmp/voice.wav"
OUTPUT="$BASE_DIR/output/reel-demo.mp4"

mkdir -p "$BASE_DIR/output"

if [ ! -f "$VIDEO_IN" ]; then
  echo "[Compose] ERROR: no existe $VIDEO_IN — ejecuta primero render-video.js"
  exit 1
fi

if [ ! -f "$AUDIO_IN" ]; then
  echo "[Compose] AVISO: no existe $AUDIO_IN — generando vídeo sin audio"
  ffmpeg -y \
    -i "$VIDEO_IN" \
    -c:v copy \
    -movflags +faststart \
    "$OUTPUT"
else
  echo "[Compose] Uniendo vídeo + audio..."
  ffmpeg -y \
    -i "$VIDEO_IN" \
    -i "$AUDIO_IN" \
    -c:v copy \
    -c:a aac \
    -b:a 128k \
    -shortest \
    -movflags +faststart \
    "$OUTPUT"
fi

SIZE=$(du -sh "$OUTPUT" | cut -f1)
echo "[Compose] Listo: $OUTPUT ($SIZE)"
