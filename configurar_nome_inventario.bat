@echo off
title Configurar Atalho http://inventario
echo ==============================================================
echo  Configurando o endereco http://inventario no seu computador
echo ==============================================================
echo.
powershell -Command "Start-Process powershell -Verb RunAs -ArgumentList '-Command Add-Content -Path ''C:\Windows\System32\drivers\etc\hosts'' -Value ''`n127.0.0.1 inventario inventario.dia'''"
echo.
echo Pronto! Agora basta abrir o navegador e acessar:
echo    http://inventario
echo.
pause
