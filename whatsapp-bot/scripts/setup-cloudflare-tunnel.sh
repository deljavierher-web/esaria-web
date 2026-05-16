#!/usr/bin/env bash
# Configura Cloudflare Tunnel para exponer el panel admin de EsarIA
# en https://admin.esaria.es protegido por Cloudflare Access.
#
# Prerequisitos:
#   1. cloudflared instalado (brew install cloudflared)
#   2. cloudflared tunnel login   (autoriza esaria.es en el navegador)
#   3. esaria.es ya gestionado por Cloudflare (lo está, por Cloudflare Pages)

set -euo pipefail

TUNNEL_NAME="esaria-admin"
HOSTNAME="admin.esaria.es"
LOCAL_URL="http://localhost:3000"
CONFIG_DIR="$HOME/.cloudflared"

if [ ! -f "$CONFIG_DIR/cert.pem" ]; then
  echo "❌ No hay cert.pem en $CONFIG_DIR"
  echo "   Ejecuta primero: cloudflared tunnel login"
  exit 1
fi

# 1) Crear el tunnel si no existe
if cloudflared tunnel list 2>/dev/null | awk '{print $2}' | grep -q "^${TUNNEL_NAME}$"; then
  echo "✓ Tunnel '$TUNNEL_NAME' ya existe"
else
  echo "→ Creando tunnel '$TUNNEL_NAME'..."
  cloudflared tunnel create "$TUNNEL_NAME"
fi

TUNNEL_ID=$(cloudflared tunnel list 2>/dev/null | awk -v n="$TUNNEL_NAME" '$2==n {print $1}')
echo "Tunnel ID: $TUNNEL_ID"

# 2) DNS route
echo "→ Configurando DNS $HOSTNAME → $TUNNEL_NAME..."
cloudflared tunnel route dns "$TUNNEL_NAME" "$HOSTNAME" 2>&1 | grep -v "already exists" || true

# 3) Config file
CFG="$CONFIG_DIR/config.yml"
cat > "$CFG" <<EOF
tunnel: $TUNNEL_ID
credentials-file: $CONFIG_DIR/${TUNNEL_ID}.json

ingress:
  - hostname: $HOSTNAME
    service: $LOCAL_URL
    originRequest:
      noTLSVerify: true
  - service: http_status:404
EOF
echo "✓ Config escrito en $CFG"

# 4) Validar config
cloudflared tunnel ingress validate

cat <<EOF

✅ Tunnel configurado.

SIGUIENTE PASO MANUAL — Activa Cloudflare Access:
  1. https://one.dash.cloudflare.com/  →  Access → Applications → Add an application
  2. Self-hosted → Application name: EsarIA Admin
  3. Session duration: 24 hours
  4. Application domain: admin.esaria.es
  5. Identity providers: Google (o One-time PIN al gmail)
  6. Policy → Action: Allow
     Include → Emails → deljavierher@gmail.com
  7. Save

Para arrancar el tunnel:
  cloudflared tunnel run $TUNNEL_NAME

Para que arranque al iniciar el Mac:
  sudo cloudflared service install
  sudo launchctl start com.cloudflare.cloudflared
EOF
