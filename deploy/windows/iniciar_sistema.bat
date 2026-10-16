@echo off
title Sistema Inventario TI DIA - Inicializador
chcp 65001 > nul
cls

echo ========================================================
echo   Iniciando Sistema de Inventario de TI - DIA
echo ========================================================
echo.

set ROOT_DIR=%~dp0..\..

:: 1. Iniciar Backend
echo [1/2] Iniciando Backend FastAPI (Porta 8000)...
cd /d "%ROOT_DIR%\backend"
if not exist "venv" (
    echo Criando ambiente virtual Python...
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate.bat
)

if not exist ".env" (
    copy .env.example .env
)

start "Inventario TI - Backend" cmd /k "call venv\Scripts\activate.bat && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

:: 2. Iniciar Frontend
echo [2/2] Iniciando Frontend (Porta 3000)...
cd /d "%ROOT_DIR%\frontend"
if not exist "node_modules" (
    echo Instalando dependencias do frontend...
    call npm install
)

start "Inventario TI - Frontend" cmd /k "npm run preview || npm run dev"

echo.
echo ========================================================
echo   Sistema inicializado com sucesso!
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo ========================================================
echo.
pause
