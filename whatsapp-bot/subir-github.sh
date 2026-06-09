#!/bin/bash
# Script de automatización de subida a GitHub para whatsapp-bot
# Creado para Javier Delgado Hernández (deljavierher-web)

# Colores para salida en consola
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== GitHub Deployer: whatsapp-bot ===${NC}"
echo -e "Este script subirá de forma segura el bot de citas de Telegram/Whisper a tu perfil de GitHub."
echo ""

# 1. Verificar directorio
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 2. Inicializar Git local si es necesario
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}[INFO] Inicializando repositorio Git local...${NC}"
    git init
    git branch -M main
fi

# 3. Crear commit local
echo -e "${YELLOW}[INFO] Preparando archivos para subir...${NC}"
git add .gitignore README.md package.json package-lock.json src/ scripts/ data/

# Comprobar si hay cambios para commitear
if git diff-index --quiet HEAD -- 2>/dev/null; then
    echo -e "${GREEN}[OK] No hay cambios nuevos en el commit actual.${NC}"
else
    echo -e "${YELLOW}[INFO] Creando commit inicial local...${NC}"
    git commit -m "Initial commit: Core engine for Telegram-Whisper appointment bot"
fi

# 4. Configurar origen remoto
USER_GITHUB="deljavierher-web"
REPO_NAME="citas-bot-whisper"
REMOTE_URL="https://github.com/${USER_GITHUB}/${REPO_NAME}.git"

echo ""
echo -e "${YELLOW}Por favor, confirma lo siguiente antes de continuar:${NC}"
echo -e "1. Ve a ${BLUE}https://github.com/new${NC}"
echo -e "2. Crea un repositorio vacío llamado: ${GREEN}${REPO_NAME}${NC}"
echo -e "3. Déjalo como ${GREEN}Público${NC} y no añadas README ni .gitignore."
echo ""
read -p "Apreta [ENTER] cuando hayas creado el repositorio en la web..."

# Configurar el origen
git remote remove origin 2>/dev/null
git remote add origin "$REMOTE_URL"

echo -e "${YELLOW}[INFO] Conectando con GitHub y subiendo código...${NC}"
if git push -u origin main; then
    echo ""
    echo -e "${GREEN}==========================================${NC}"
    echo -e "${GREEN}[OK] ¡PROYECTO SUBIDO CON ÉXITO A GITHUB!${NC}"
    echo -e "${GREEN}URL del proyecto: https://github.com/${USER_GITHUB}/${REPO_NAME}${NC}"
    echo -e "${GREEN}==========================================${NC}"
else
    echo ""
    echo -e "${RED}[ERROR] El push falló.${NC}"
    echo -e "Si es la primera vez, asegúrate de que creaste el repositorio en GitHub con el nombre correcto: '${REPO_NAME}'"
fi
