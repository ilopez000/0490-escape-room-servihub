@echo off
title ServiHub Kernel Panic - escape room 0490
cd /d "%~dp0"
where node >nul 2>nul || (echo Cal instal.lar Node.js 22 o superior: https://nodejs.org & pause & exit /b)
if not exist node_modules (echo Instal.lant dependencies, nomes el primer cop... & call npm install)
echo.
echo Arrencant el joc a http://localhost:4325  (tanca aquesta finestra per aturar-lo)
call npm run dev -- --open
pause
