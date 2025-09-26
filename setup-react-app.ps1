# TSV Rot React App - Setup Script
# Korrekte PowerShell-Syntax

Write-Host "TSV ROT TRAINER-APP - REACT VERSION" -ForegroundColor Cyan
Write-Host "Setup fuer die neue React-Anwendung" -ForegroundColor Green
Write-Host "Mit allen Admin-Features die in der alten App fehlen" -ForegroundColor Green

$projectPath = "C:\Projekte\TSVRotTrainer"

# Node.js pruefen
try {
    $nodeVersion = node --version
    Write-Host "Node.js Version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js nicht gefunden! Bitte installieren Sie Node.js" -ForegroundColor Red
    Write-Host "Download: https://nodejs.org" -ForegroundColor Yellow
    pause
    exit
}

# Yarn pruefen
try {
    $yarnVersion = yarn --version
    Write-Host "Yarn Version: $yarnVersion" -ForegroundColor Green
} catch {
    Write-Host "Yarn nicht gefunden. Installiere Yarn..." -ForegroundColor Yellow
    npm install -g yarn
}

# Projektstruktur erstellen
Write-Host "Erstelle React-Projektstruktur..." -ForegroundColor Cyan

$directories = @(
    "src",
    "src/components",
    "src/components/auth", 
    "src/components/trainers",
    "src/components/courses",
    "src/components/absences",
    "src/components/ui",
    "src/services",
    "src/hooks", 
    "src/types",
    "src/utils",
    "api",
    "database"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Erstellt: $dir" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "WICHTIG: React-Dateien hinzufuegen" -ForegroundColor Yellow
Write-Host ""
Write-Host "Sie muessen jetzt die React-Dateien herunterladen:" -ForegroundColor White
Write-Host "1. package.json - Dependencies" -ForegroundColor White
Write-Host "2. src/App.tsx - Haupt-App" -ForegroundColor White  
Write-Host "3. src/main.tsx - Entry Point" -ForegroundColor White
Write-Host "4. src/components/ - Alle Komponenten" -ForegroundColor White
Write-Host "5. api/index.php - Backend API" -ForegroundColor White
Write-Host "6. database/tsv-rot-data.sql - Echte Daten" -ForegroundColor White
Write-Host ""
Write-Host "Nach Download erneut ausfuehren: .\setup-react-app.ps1" -ForegroundColor Yellow

# Pruefen ob package.json existiert
if (Test-Path "package.json") {
    Write-Host ""
    Write-Host "package.json gefunden! Installiere Dependencies..." -ForegroundColor Green
    
    try {
        yarn install
        Write-Host "Dependencies erfolgreich installiert!" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "SETUP ABGESCHLOSSEN!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Naechste Schritte:" -ForegroundColor Yellow
        Write-Host "1. 'yarn dev' - Entwicklungsserver starten" -ForegroundColor White
        Write-Host "2. Browser oeffnet sich unter http://localhost:3000" -ForegroundColor White
        Write-Host "3. Login: TSVAdmin2024 oder TSVRot2024" -ForegroundColor White
        
        $startNow = Read-Host "Entwicklungsserver jetzt starten? (j/n)"
        if ($startNow -eq "j" -or $startNow -eq "J") {
            Write-Host "Starte Entwicklungsserver..." -ForegroundColor Cyan
            yarn dev
        }
        
    } catch {
        Write-Host "Fehler bei der Installation der Dependencies" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "package.json nicht gefunden!" -ForegroundColor Red
    Write-Host "Bitte erst die React-Dateien herunterladen." -ForegroundColor Yellow
}

pause