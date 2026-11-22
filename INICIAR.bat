@echo off
title Sistema Escolar - Prueba piloto
cd /d "%~dp0"
if not exist node_modules (
  echo Primera vez: instalando, espera un momento...
  call npm install
)
echo.
echo Iniciando el sistema. NO cierres esta ventana mientras lo uses.
echo Para apagarlo, cierra esta ventana o pulsa Ctrl + C.
call npm run dev
pause
