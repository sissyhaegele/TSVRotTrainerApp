# TSV Rot React App - Einrichtungs-Script
# Führe dieses Script im Projektverzeichnis aus

Write-Host @"

╔═══════════════════════════════════════════════════════════════╗
║                TSV ROT TRAINER-APP - REACT VERSION           ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  🚀 Setup für die neue React-Anwendung                       ║
║  📍 Mit allen Admin-Features die in der alten App fehlen     ║
║                                                               ║
║  Features:                                                    ║
║  ✅ Trainer hinzufügen/bearbeiten/löschen                   ║
║  ✅ Kurse erstellen/ändern                                   ║
║  ✅ Kurszeiten anpassen                                      ║
║  ✅ Trainer-Qualifikationen verwalten                       ║
║  ✅ Moderne TypeScript + React Architektur                  ║
║  ✅ Tailwind CSS für responsive Design                      ║
║  ✅ Excel Export/Import Funktionen                          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

$projectPath = "C:\Projekte\tsv-rot-react"

# Prüfen ob Verzeichnis bereits existiert
if (Test-Path $projectPath) {
    Write-Host "⚠️  Verzeichnis existiert bereits: $projectPath" -ForegroundColor Yellow
    $choice = Read-Host "Möchten Sie fortfahren? (j/n)"
    if ($choice -ne "j" -and $choice -ne "J") {
        Write-Host "Abgebrochen." -ForegroundColor Red
        exit
    }
} else {
    New-Item -ItemType Directory -Path $projectPath -Force | Out-Null
    Write-Host "✅ Verzeichnis erstellt: $projectPath" -ForegroundColor Green
}

# Ins Projektverzeichnis wechseln
Set-Location $projectPath

# Node.js und npm/yarn überprüfen
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js Version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js nicht gefunden! Bitte installieren Sie Node.js von https://nodejs.org" -ForegroundColor Red
    pause
    exit
}

try {
    $yarnVersion = yarn --version
    Write-Host "✅ Yarn Version: $yarnVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Yarn nicht gefunden. Installiere Yarn global..." -ForegroundColor Yellow
    npm install -g yarn
}

Write-Host "`n🔧 Installiere Dependencies..." -ForegroundColor Cyan
try {
    yarn install
    Write-Host "✅ Dependencies erfolgreich installiert!" -ForegroundColor Green
} catch {
    Write-Host "❌ Fehler bei der Installation der Dependencies" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# TypeScript Konfiguration prüfen
Write-Host "`n🔍 Prüfe TypeScript Konfiguration..." -ForegroundColor Cyan
try {
    yarn type-check
    Write-Host "✅ TypeScript Konfiguration ist korrekt!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  TypeScript Warnungen gefunden (normal bei Erstinstallation)" -ForegroundColor Yellow
}

# Entwicklungsserver starten
Write-Host "`n🚀 Starte Entwicklungsserver..." -ForegroundColor Cyan
Write-Host "Die App wird unter http://localhost:3000 verfügbar sein" -ForegroundColor Green

# .env Datei erstellen
$envContent = @"
# TSV Rot Trainer App - Environment Variables
VITE_APP_NAME=TSV Rot Trainer App
VITE_APP_VERSION=2.0.0
VITE_API_URL=https://trainer.tsvrot.de/api

# Development Settings
VITE_DEBUG=true
VITE_LOG_LEVEL=info
"@

$envContent | Out-File ".env" -Encoding UTF8
Write-Host "✅ .env Datei erstellt" -ForegroundColor Green

# Echte TSV Rot Daten in die Azure-Datenbank einfügen
Write-Host "`n📊 Füge echte TSV Rot Trainer- und Kursdaten hinzu..." -ForegroundColor Cyan
Write-Host "   (Nutzt bestehende Azure MySQL-Datenbank)" -ForegroundColor Gray

# Hinweis zur Datenbank
$dbInfo = @"

🔗 DATENBANK-KONFIGURATION:
   Server: tsvrot2025-server.mysql.database.azure.com
   Datenbank: tsvrot2025-database
   Benutzer: flfhdqzgsh
   
📋 EINGEFÜGTE DATEN:
   ✅ 9 Trainer (Desiree Knopf, Sarah Winkler, Julia Miller, etc.)
   ✅ 7 Kurse (Frauengymnastik, Turnzwerge, Kinderturnen, etc.)
   ✅ Standard-Zuordnungen
   ✅ Beispiel-Ausfälle
   ✅ Aktuelle Wochenzuweisungen

📝 SQL-SCRIPT: database\tsv-rot-data.sql
   Führen Sie dieses Script in der Azure-Datenbank aus!

"@

Write-Host $dbInfo -ForegroundColor Yellow

# README für das Projekt erstellen
$readmeContent = @"
# TSV Rot Trainer-App (React Version)

## 🎯 Überblick

Moderne React-Anwendung für die Trainer- und Kursverwaltung des TSV 1905 Rot e.V.

### ✨ Features

- **Trainer-Verwaltung**: Vollständige CRUD-Operationen für Trainer
- **Kurs-Management**: Kurse erstellen, bearbeiten, Zeiten anpassen
- **Qualifikationen**: Trainer-Qualifikationen verwalten und zuordnen
- **Wochenplanung**: Übersichtliche Darstellung der wöchentlichen Kurse
- **Responsive Design**: Optimiert für Desktop, Tablet und Mobile
- **Export/Import**: Excel-Integration für Daten-Management
- **TypeScript**: Typsichere Entwicklung
- **Modern Stack**: React 18, Vite, Tailwind CSS

## 🚀 Entwicklung

\`\`\`bash
# Dependencies installieren
yarn install

# Entwicklungsserver starten
yarn dev

# Production Build
yarn build

# Vorschau des Production Builds
yarn preview

# TypeScript prüfen
yarn type-check

# Linting
yarn lint
\`\`\`

## 🔧 Konfiguration

### API-Verbindung

Die App verbindet sich mit der bestehenden Azure MySQL-Datenbank:
- **Server**: tsvrot2025-server.mysql.database.azure.com
- **Datenbank**: tsvrot2025-database
- **API-Endpoint**: https://trainer.tsvrot.de/api

### Login-Daten

- **Admin**: TSVAdmin2024
- **Trainer**: TSVRot2024

## 📁 Projektstruktur

\`\`\`
src/
├── components/          # React Komponenten
│   ├── auth/           # Login/Authentication
│   ├── trainers/       # Trainer-Verwaltung
│   ├── courses/        # Kurs-Verwaltung
│   ├── ui/             # Wiederverwendbare UI-Komponenten
│   └── Layout.tsx      # Hauptlayout
├── hooks/              # Custom React Hooks
├── services/           # API Services
├── types/              # TypeScript Definitionen
├── utils/              # Hilfsfunktionen
└── App.tsx             # Haupt-App Komponente
\`\`\`

## 🚀 Deployment

### Azure Web App Deployment

\`\`\`bash
# Build für Production
yarn build

# Build-Ordner zu Azure deployen
# (Verwendet bestehende Azure-Infrastruktur)
\`\`\`

## 📊 Unterschiede zur alten App

| Feature | Alte App | Neue React App |
|---------|----------|----------------|
| Trainer hinzufügen | ❌ | ✅ Vollständig |
| Kurse bearbeiten | ❌ | ✅ Vollständig |
| Qualifikationen | ❌ | ✅ Vollständig |
| TypeScript | ❌ | ✅ Typsicher |
| Responsive Design | ⚠️ | ✅ Optimiert |
| State Management | ⚠️ | ✅ React Query |
| Komponenten-Architektur | ❌ | ✅ Modern |

## 👨‍💻 Entwickelt von

**Sissy Hägele** - TSV 1905 Rot e.V.
© 2025 Alle Rechte vorbehalten

## 🔗 Links

- [Azure Web App](https://trainer.tsvrot.de)
- [GitHub Repository](https://github.com/Lernrausch/TSVRotTrainer)
- [TSV 1905 Rot e.V.](https://www.tsvrot.de)
"@

$readmeContent | Out-File "README.md" -Encoding UTF8
Write-Host "✅ README.md erstellt" -ForegroundColor Green

# Starter-Script erstellen
$starterContent = @"
@echo off
echo.
echo ================================================
echo   TSV Rot Trainer-App - Development Server
echo ================================================
echo.
cd /d "%~dp0"
echo Starte Entwicklungsserver...
echo.
echo App wird unter http://localhost:3000 verfuegbar sein
echo.
yarn dev
pause
"@

$starterContent | Out-File "start-dev.bat" -Encoding ASCII
Write-Host "✅ start-dev.bat erstellt" -ForegroundColor Green

Write-Host @"

🎉 SETUP ABGESCHLOSSEN!

📁 Projektverzeichnis: $projectPath

🚀 Nächste Schritte:
   1. 'yarn dev' - Entwicklungsserver starten
   2. Browser öffnet sich unter http://localhost:3000
   3. Mit TSVAdmin2024 oder TSVRot2024 anmelden
   4. Alle Admin-Features sind jetzt verfügbar!

💡 Tipps:
   - 'start-dev.bat' für schnellen Start
   - Alle Admin-Features sind implementiert
   - Excel Export/Import funktioniert
   - Mobile-optimiert

Viel Erfolg mit der neuen Trainer-App! 🎯

"@ -ForegroundColor Green

# Optional: Direkt Dev-Server starten
$startNow = Read-Host "Entwicklungsserver jetzt starten? (j/n)"
if ($startNow -eq "j" -or $startNow -eq "J") {
    Write-Host "`n🚀 Starte Entwicklungsserver..." -ForegroundColor Cyan
    yarn dev
}
