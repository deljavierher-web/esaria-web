#!/usr/bin/env bash
# setup-kokoro.sh
# Instala Kokoro TTS usando Python 3.12 via Homebrew.
# Requiere: brew install python@3.12  (si no está instalado)
#
# Uso: bash scripts/setup-kokoro.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
VENV="$BASE_DIR/.venv312"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Setup Kokoro TTS con Python 3.12"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── 1. Comprobar Python 3.12 ──────────────────────────────────────────────────
PYTHON312=""
for candidate in python3.12 /opt/homebrew/bin/python3.12 /usr/local/bin/python3.12; do
  if command -v "$candidate" &>/dev/null; then
    PYTHON312="$candidate"
    break
  fi
done

if [ -z "$PYTHON312" ]; then
  echo "Python 3.12 no encontrado."
  echo ""
  echo "Instálalo con Homebrew:"
  echo "  brew install python@3.12"
  echo ""
  echo "Después vuelve a ejecutar este script."
  exit 1
fi

echo "✓ Python 3.12 encontrado: $PYTHON312  ($("$PYTHON312" --version))"
echo ""

# ── 2. Crear venv ─────────────────────────────────────────────────────────────
if [ -d "$VENV" ]; then
  echo "✓ Entorno virtual ya existe: $VENV"
else
  echo "Creando entorno virtual en $VENV ..."
  "$PYTHON312" -m venv "$VENV"
  echo "✓ Entorno creado"
fi
echo ""

# ── 3. Instalar Kokoro ────────────────────────────────────────────────────────
echo "Instalando Kokoro + dependencias (puede tardar 2-5 min la primera vez)..."
"$VENV/bin/pip" install --upgrade pip --quiet
"$VENV/bin/pip" install kokoro soundfile numpy 2>&1 | tail -5

echo ""
echo "Verificando instalación..."
if "$VENV/bin/python" -c "from kokoro import KPipeline; print('✓ Kokoro importado correctamente')"; then
  echo ""
  echo "✅ Kokoro listo."
  echo ""
  echo "Para generar voz de prueba:"
  echo "  TTS_ENGINE=kokoro bash scripts/make-reel.sh"
  echo ""
  echo "Para probar sin generar MP4:"
  echo "  TTS_ENGINE=kokoro '$VENV/bin/python' scripts/make-voice.py"
else
  echo ""
  echo "❌ Error al importar Kokoro. Revisa los mensajes anteriores."
  exit 1
fi
