#!/usr/bin/env bash
# setup-piper.sh
# Descarga el binario de Piper TTS para macOS ARM64 y el modelo es_ES-sharvard-medium.
#
# Piper TTS es un motor de síntesis neural VITS, ligero y offline.
# El modelo es_ES-sharvard-medium es el de mejor calidad para español de España.
#
# Uso: bash scripts/setup-piper.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
PIPER_DIR="$BASE_DIR/assets/piper"
mkdir -p "$PIPER_DIR"

PIPER_BIN="$PIPER_DIR/piper"
MODEL_ONNX="$PIPER_DIR/es_ES-sharvard-medium.onnx"
MODEL_JSON="$PIPER_DIR/es_ES-sharvard-medium.onnx.json"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Setup Piper TTS — EsarIA Pipeline"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── 1. Binario Piper ──────────────────────────────────────────────────────────
if [ -f "$PIPER_BIN" ]; then
  echo "✓ Binario Piper ya existe: $PIPER_BIN"
else
  echo "Descargando Piper para macOS ARM64..."
  echo ""
  echo "  Ve a: https://github.com/rhasspy/piper/releases/latest"
  echo "  Descarga: piper_macos_aarch64.tar.gz  (macOS Apple Silicon)"
  echo "  Extrae el binario 'piper' en:"
  echo "  $PIPER_DIR/"
  echo ""
  echo "  O usando curl (ajusta la versión a la más reciente en GitHub):"
  echo "  curl -L https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_macos_aarch64.tar.gz | tar -xz -C '$PIPER_DIR' --strip-components=1"
  echo ""
  echo "  ⚠️  Verifica la URL en el repositorio — la versión puede haber cambiado."
  echo ""
fi

# ── 2. Modelo de voz ──────────────────────────────────────────────────────────
if [ -f "$MODEL_ONNX" ] && [ -f "$MODEL_JSON" ]; then
  echo "✓ Modelo es_ES-sharvard-medium ya existe"
else
  echo "Descargando modelo es_ES-sharvard-medium..."
  echo ""
  echo "  Descarga los dos archivos de:"
  echo "  https://github.com/rhasspy/piper/blob/master/VOICES.md"
  echo "  (busca 'es_ES' → 'sharvard' → medium)"
  echo ""
  echo "  O con curl:"
  BASE_URL="https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/sharvard/medium"
  echo "  curl -L '$BASE_URL/es_ES-sharvard-medium.onnx' -o '$MODEL_ONNX'"
  echo "  curl -L '$BASE_URL/es_ES-sharvard-medium.onnx.json' -o '$MODEL_JSON'"
  echo ""
fi

# ── 3. Verificación ───────────────────────────────────────────────────────────
echo "Estado actual en $PIPER_DIR/:"
ls -lh "$PIPER_DIR/" 2>/dev/null || echo "  (vacío)"
echo ""

if [ -f "$PIPER_BIN" ] && [ -f "$MODEL_ONNX" ] && [ -f "$MODEL_JSON" ]; then
  chmod +x "$PIPER_BIN"
  echo "✅ Piper listo. Para generar voz de prueba:"
  echo ""
  echo "  echo 'Hola, soy EsarIA.' | '$PIPER_BIN' --model '$MODEL_ONNX' --output_file tmp/test-piper.wav"
  echo "  afplay tmp/test-piper.wav"
  echo ""
  echo "Para usar en el pipeline:"
  echo "  TTS_ENGINE=piper bash scripts/make-reel.sh"
else
  echo "⏳ Descarga los archivos indicados arriba y vuelve a ejecutar este script."
  echo ""
  echo "Alternativa rápida con descarga directa:"
  echo "  bash scripts/setup-piper.sh --download"
fi

# ── Opción --download: descarga directa (si se pasa el flag) ──────────────────
if [[ "${1:-}" == "--download" ]]; then
  echo ""
  echo "Intentando descarga directa..."

  if [ ! -f "$PIPER_BIN" ]; then
    PIPER_URL="https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_macos_aarch64.tar.gz"
    echo "  → Descargando binario Piper..."
    curl -L --progress-bar "$PIPER_URL" | tar -xz -C "$PIPER_DIR" --strip-components=1 2>/dev/null || \
      echo "  ✗ Error descargando binario. Verifica la URL en GitHub releases."
  fi

  if [ ! -f "$MODEL_ONNX" ]; then
    HF_BASE="https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/sharvard/medium"
    echo "  → Descargando modelo ONNX (~38 MB)..."
    curl -L --progress-bar "$HF_BASE/es_ES-sharvard-medium.onnx" -o "$MODEL_ONNX"
    echo "  → Descargando configuración JSON..."
    curl -L --progress-bar "$HF_BASE/es_ES-sharvard-medium.onnx.json" -o "$MODEL_JSON"
  fi

  if [ -f "$PIPER_BIN" ]; then
    chmod +x "$PIPER_BIN"
  fi

  echo ""
  echo "Estado final:"
  ls -lh "$PIPER_DIR/" 2>/dev/null
fi
