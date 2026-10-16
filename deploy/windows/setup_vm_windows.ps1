# ==============================================================================
# Script de Instalação e Configuração na VM Windows
# Execute no PowerShell da VM Windows (como Administrador)
# ==============================================================================

Write-Host "=== [1/4] Verificando Pre-requisitos (Python e Node.js) ===" -ForegroundColor Cyan

# Verifica Python
try {
    $pyVer = & python --version 2>&1
    Write-Host "Python encontrado: $pyVer" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Python nao encontrado no PATH do Windows." -ForegroundColor Red
    Write-Host "Baixe e instale o Python marcando 'Add python.exe to PATH'." -ForegroundColor Yellow
    exit 1
}

# Verifica Node.js
try {
    $nodeVer = & node --version 2>&1
    Write-Host "Node.js encontrado: $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Node.js nao encontrado no PATH do Windows." -ForegroundColor Red
    Write-Host "Baixe e instale o Node.js LTS em https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

$RootDir = Resolve-Path "$PSScriptRoot\..\.."
$BackendDir = "$RootDir\backend"
$FrontendDir = "$RootDir\frontend"

Write-Host "`n=== [2/4] Configurando Backend Python ===" -ForegroundColor Cyan
Set-Location $BackendDir

if (-not (Test-Path "$BackendDir\venv")) {
    Write-Host "Criando ambiente virtual (venv)..."
    python -m venv venv
}

Write-Host "Instalando dependencias do backend..."
& "$BackendDir\venv\Scripts\pip.exe" install --upgrade pip
& "$BackendDir\venv\Scripts\pip.exe" install -r "$BackendDir\requirements.txt"

if (-not (Test-Path "$BackendDir\.env")) {
    Copy-Item "$BackendDir\.env.example" "$BackendDir\.env"
    Write-Host "Arquivo backend\.env criado a partir de .env.example." -ForegroundColor Yellow
}

New-Item -ItemType Directory -Force -Path "$BackendDir\uploads\termos" | Out-Null

Write-Host "`n=== [3/4] Configurando Frontend Node/Vite ===" -ForegroundColor Cyan
Set-Location $FrontendDir

if (-not (Test-Path "$FrontendDir\.env")) {
    Copy-Item "$FrontendDir\.env.example" "$FrontendDir\.env"
}

Write-Host "Instalando dependencias npm..."
npm install

Write-Host "Compilando versao de producao (build)..."
npm run build

Write-Host "`n=== [4/4] Liberando Portas no Firewall do Windows ===" -ForegroundColor Cyan
& "$PSScriptRoot\liberar_firewall.ps1"

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " Instalacao na VM Windows concluida com sucesso!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Para iniciar o sistema via SSH em segundo plano, execute:"
Write-Host "  powershell -File .\deploy\windows\iniciar_background.ps1"
Write-Host "`nPara iniciar automaticamente com o Windows (sem precisar logar):"
Write-Host "  powershell -File .\deploy\windows\configurar_inicializacao_automatica.ps1"
Write-Host "=========================================================="
