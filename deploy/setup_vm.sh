#!/usr/bin/env bash
# ==============================================================================
# Script de Instalação e Deploy do Sistema de Inventário TI DIA na VM (Ubuntu/Debian)
# ==============================================================================

set -e

echo "=== [1/6] Atualizando pacotes do sistema ==="
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv nginx curl git ufw

# Instalar Node.js 20 LTS se não estiver instalado
if ! command -v node &> /dev/null; then
    echo "=== Instalando Node.js 20 LTS ==="
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Diretório base
APP_DIR="/var/www/inventario-ti"
echo "=== [2/6] Preparando diretório em $APP_DIR ==="
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Nota: copie os arquivos do projeto para $APP_DIR antes ou clone o repositório
if [ ! -d "$APP_DIR/backend" ]; then
    echo "Copie os arquivos do projeto para $APP_DIR e execute este script novamente."
    exit 1
fi

echo "=== [3/6] Configurando Backend (Python / FastAPI) ==="
cd "$APP_DIR/backend"
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Cria .env padrão se não existir
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "Arquivo backend/.env criado a partir de .env.example."
fi

mkdir -p uploads/termos
deactivate

echo "=== [4/6] Configurando Frontend (Node / React / Vite) ==="
cd "$APP_DIR/frontend"
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "VITE_API_URL=/api" > .env
fi
npm install
npm run build

echo "=== [5/6] Configurando Nginx ==="
sudo cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/inventario-ti
sudo ln -sf /etc/nginx/sites-available/inventario-ti /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo "=== [6/6] Configurando Serviço Systemd para o Backend ==="
sudo cp "$APP_DIR/deploy/inventario-backend.service" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable inventario-backend
sudo systemctl restart inventario-backend

echo "======================================================"
echo " Deploy concluído com sucesso!"
echo " Backend rodando via Systemd (inventario-backend.service)"
echo " Frontend servido pelo Nginx na porta 80"
echo "======================================================"
