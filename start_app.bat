@echo off
cd /d "C:\Users\USUARIO\Documents\projetosclaude\pwa_alcool_app\pwa_integrated"
echo Iniciando servidor de desenvolvimento...
echo.
start cmd /k ".\node_modules\.bin\next.cmd dev"
timeout /t 5 /nobreak > nul
echo Abrindo navegador...
start http://localhost:3000
