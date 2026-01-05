Set-Location "C:\Users\USUARIO\Documents\projetosclaude\pwa_alcool_app\pwa_integrated"
Write-Host "Iniciando servidor Next.js..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\USUARIO\Documents\projetosclaude\pwa_alcool_app\pwa_integrated'; .\node_modules\.bin\next.cmd dev"
Start-Sleep -Seconds 5
Write-Host "Abrindo navegador..." -ForegroundColor Green
Start-Process "http://localhost:3000"
