@echo off
title Atualizar Inventario TI - VM
echo ==============================================================
echo  Atualizando Sistema de Inventario TI na VM
echo ==============================================================
echo.
cd /d C:\InventarioTI

echo [1/3] Baixando atualizacoes do Git...
git pull origin main

echo.
echo [2/3] Compilando nova versao do Frontend...
cd frontend
call npm run build
cd ..

echo.
echo [3/3] Reiniciando os servicos na VM...
powershell -ExecutionPolicy Bypass -File deploy\windows\parar_sistema.ps1
powershell -ExecutionPolicy Bypass -File deploy\windows\iniciar_background.ps1

echo.
echo ==============================================================
echo  Atualizacao concluida com sucesso!
echo  Pressione Ctrl + F5 no navegador para ver as mudancas.
echo ==============================================================
echo.
pause
