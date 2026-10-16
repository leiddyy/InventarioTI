# ==============================================================================
# Script PowerShell para Liberar as Portas no Firewall do Windows na VM
# Execute como Administrador no PowerShell da VM
# ==============================================================================

Write-Host "Configurando regras de Firewall do Windows para o Inventario TI..." -ForegroundColor Cyan

# 1. Liberar Porta 8000 (Backend FastAPI)
New-NetFirewallRule -DisplayName "Inventario TI - Backend (Porta 8000)" `
    -Direction Inbound `
    -LocalPort 8000 `
    -Protocol TCP `
    -Action Allow `
    -ErrorAction SilentlyContinue

# 2. Liberar Porta 3000 (Frontend)
New-NetFirewallRule -DisplayName "Inventario TI - Frontend (Porta 3000)" `
    -Direction Inbound `
    -LocalPort 3000 `
    -Protocol TCP `
    -Action Allow `
    -ErrorAction SilentlyContinue

# 3. Liberar Porta 80 (HTTP padrão caso use IIS ou Nginx Windows)
New-NetFirewallRule -DisplayName "Inventario TI - HTTP (Porta 80)" `
    -Direction Inbound `
    -LocalPort 80 `
    -Protocol TCP `
    -Action Allow `
    -ErrorAction SilentlyContinue

Write-Host "Regras do Firewall criadas com sucesso! Portas 8000, 3000 e 80 liberadas." -ForegroundColor Green
