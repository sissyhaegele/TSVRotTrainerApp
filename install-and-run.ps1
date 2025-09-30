Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "TSV Rot Trainer App - Installation" -ForegroundColor Cyan  
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Installiere Abhängigkeiten..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "[2/3] Starte Entwicklungsserver..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Die App wird gleich im Browser unter http://localhost:5173 geöffnet" -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 2

Start-Process "http://localhost:5173"

Write-Host "[3/3] Server läuft..." -ForegroundColor Green
npm run dev
