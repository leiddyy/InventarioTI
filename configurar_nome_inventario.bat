@echo off
:: Verifica se esta executando como Administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Solicitando privilegios de Administrador...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo ==============================================================
echo  Configurando o endereco http://inventario no seu computador
echo ==============================================================
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0fix_hosts.ps1"

echo.
echo ==============================================================
echo  Configuracao concluida com sucesso!
echo ==============================================================
echo.
echo Agora voce pode acessar no seu navegador:
echo   - http://inventario
echo   - http://inventario.dia
echo.
echo (Importante: Se usar o Opera GX, desative o VPN para sites locais)
echo.
pause
