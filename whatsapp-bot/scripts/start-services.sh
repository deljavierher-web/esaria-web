#!/bin/zsh
set -e

PROJECT_DIR="/Users/javidel/Library/CloudStorage/GoogleDrive-deljavierher@gmail.com/Mi unidad/EsarIA/whatsapp-bot"

log() {
  echo "$(date '+%Y-%m-%dT%H:%M:%S') $1" >> /tmp/esaria-startup.log
}

log "Iniciando servicios EsarIA..."

pkill -f "ngrok http 3000" 2>/dev/null || true
pkill -f "node --watch src/server.js" 2>/dev/null || true
sleep 1

log "Arrancando ngrok..."
ngrok http 3000 --log=stdout > /tmp/esaria-ngrok.log 2>&1 &
for i in $(seq 1 12); do
  if curl -s http://127.0.0.1:4040/api/tunnels > /dev/null 2>&1; then
    log "ngrok listo"
    break
  fi
  sleep 2
done

log "Arrancando bot..."
cd "$PROJECT_DIR"
node src/server.js >> /tmp/esaria-bot.log 2>&1 &
log "Bot iniciado en PID $!"

log "Servicios EsarIA arrancados"
