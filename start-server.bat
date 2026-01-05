@echo off
cd /d "C:\Users\USUARIO\Documents\projetosclaude\pwa_alcool_app\pwa_integrated"
echo ====================================
echo Iniciando servidor Next.js...
echo ====================================
echo.
"C:\Program Files\nodejs\node.exe" .\node_modules\next\dist\bin\next dev
echo.
echo ====================================
echo Servidor encerrado ou erro ocorreu
echo ====================================
pause
