#!/usr/bin/env bash
# Arranca el bot EsarIA en background (sobrevive a cerrar terminal).
# Úsalo tras un reinicio del Mac.
#
#   bash scripts/start-bot.sh
#
# El tunnel a admin.esaria.es es un LaunchAgent y arranca solo.

set -e

cd "$(dirname "$0")/.."
BOT_DIR="$(pwd)"

# Mata cualquier instancia previa del bot
pkill -f "node src/server.js" 2>/dev/null || true
sleep 1

# Arranca en background con log en ~/Library/Logs/esaria-bot.log
mkdir -p "$HOME/Library/Logs"
nohup /opt/homebrew/bin/node src/server.js > "$HOME/Library/Logs/esaria-bot.log" 2>&1 &
disown
sleep 2

# Verifica
if curl -s -f http://127.0.0.1:3000/health > /dev/null; then
  echo "✅ Bot arrancado correctamente."
  echo "   Panel local:    http://127.0.0.1:3000/admin/"
  echo "   Panel público:  https://admin.esaria.es"
  echo "   Log:            $HOME/Library/Logs/esaria-bot.log"
else
  echo "❌ El bot no responde. Mira el log:"
  tail -20 "$HOME/Library/Logs/esaria-bot.log"
  exit 1
fi
