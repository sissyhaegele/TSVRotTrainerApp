# ============================================================================
# TSV Rot Trainer-App - Setup für sissyhaegele
# ============================================================================
# Angepasst für: C:\Projekte\TSVRotTrainer
# GitHub: https://github.com/sissyhaegele
# Sync: GitHub Desktop
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectPath = "C:\Projekte\TSVRotTrainer",
    
    [Parameter(Mandatory=$false)]
    [string]$GitHubUsername = "sissyhaegele",
    
    [Parameter(Mandatory=$false)]
    [string]$RepoName = "tsv-rot-trainer",
    
    [Parameter(Mandatory=$false)]
    [switch]$CreateRepo = $false
)

# Farben für bessere Lesbarkeit
function Write-Step {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "`n$Message" -ForegroundColor $Color
    Write-Host ("─" * 60) -ForegroundColor Gray
}

# ============================================================================
# START
# ============================================================================

Clear-Host
Write-Host @"
═══════════════════════════════════════════════════════════════
     TSV ROT 1905 - TRAINER-APP SETUP
     GitHub: sissyhaegele
     Pfad: C:\Projekte\TSVRotTrainer
═══════════════════════════════════════════════════════════════
"@ -ForegroundColor Red

# ============================================================================
# SCHRITT 1: Projekt-Ordner erstellen
# ============================================================================

Write-Step "📁 Schritt 1: Projekt-Ordner vorbereiten"

# Ordner erstellen falls nicht vorhanden
if (!(Test-Path $ProjectPath)) {
    New-Item -ItemType Directory -Path $ProjectPath -Force | Out-Null
    Write-Host "✅ Ordner erstellt: $ProjectPath" -ForegroundColor Green
} else {
    Write-Host "✅ Ordner existiert bereits: $ProjectPath" -ForegroundColor Green
}

# In Ordner wechseln
Set-Location $ProjectPath
Write-Host "📂 Arbeitsverzeichnis: $(Get-Location)" -ForegroundColor Yellow

# ============================================================================
# SCHRITT 2: Git initialisieren (falls noch nicht geschehen)
# ============================================================================

Write-Step "🔧 Schritt 2: Git Repository initialisieren"

if (!(Test-Path .git)) {
    git init
    Write-Host "✅ Git Repository initialisiert" -ForegroundColor Green
    
    # Setze Branch auf main
    git branch -M main
    Write-Host "✅ Hauptbranch auf 'main' gesetzt" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Git Repository bereits vorhanden" -ForegroundColor Yellow
}

# Git Config setzen
git config user.name "Sissy Haegele"
git config user.email "sissy.haegele@gmail.com"  # Bitte anpassen!
Write-Host "✅ Git Konfiguration gesetzt" -ForegroundColor Green

# ============================================================================
# SCHRITT 3: App-Dateien erstellen
# ============================================================================

Write-Step "📝 Schritt 3: App-Dateien erstellen"

# index.html - Vollständige TSV Rot Trainer-App
Write-Host "Erstelle index.html..." -ForegroundColor Yellow
@'
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TSV Rot 1905 - Trainer & Stundenplanung</title>
    <meta name="description" content="Digitale Trainer- und Stundenplanung für die Turnabteilung des TSV Rot 1905 e.V.">
    <meta name="author" content="TSV Rot 1905 e.V.">
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    
    <!-- Externe Bibliotheken -->
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap');
        
        :root {
            --tsv-rot: #DC2626;
            --tsv-rot-dark: #991B1B;
        }
        
        body {
            font-family: 'Open Sans', sans-serif;
        }
        
        .tsv-red { color: var(--tsv-rot); }
        .bg-tsv-red { background-color: var(--tsv-rot); }
        .bg-tsv-red-dark { background-color: var(--tsv-rot-dark); }
        .border-tsv-red { border-color: var(--tsv-rot); }
        
        /* Scrollbar Styling */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: var(--tsv-rot); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--tsv-rot-dark); }
        
        /* Loading Animation */
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
        }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        // TSV Rot Trainer-App - Hauptkomponente
        const { useState, useEffect, useMemo } = React;
        
        function TrainerApp() {
            // State für Kurse und Trainer
            const [courses, setCourses] = useState(() => {
                const saved = localStorage.getItem('tsv-rot-courses');
                return saved ? JSON.parse(saved) : [
                    { id: 1, name: 'Turnzwerge Gruppe 1', day: 'Dienstag', time: '15:00', location: 'Sporthalle Rot', trainers: ['Desiree Knopf'], required: 2 },
                    { id: 2, name: 'Kinderturnen ab 5', day: 'Freitag', time: '15:30', location: 'Sporthalle Rot', trainers: [], required: 2 },
                    { id: 3, name: 'Frauengymnastik', day: 'Montag', time: '20:00', location: 'Mehrzweckhalle', trainers: ['Irmgard Stegmüller'], required: 1 }
                ];
            });
            
            const [trainers, setTrainers] = useState(() => {
                const saved = localStorage.getItem('tsv-rot-trainers');
                return saved ? JSON.parse(saved) : [
                    { id: 1, name: 'Desiree Knopf', qualifications: ['Kinderturnen'], availability: ['Dienstag'] },
                    { id: 2, name: 'Irmgard Stegmüller', qualifications: ['Gymnastik', 'Senioren'], availability: ['Montag', 'Dienstag'] },
                    { id: 3, name: 'Ulrike Keßler', qualifications: ['Aerobic', 'Dance'], availability: ['Montag'] }
                ];
            });
            
            const [activeTab, setActiveTab] = useState('dashboard');
            const [lastSaved, setLastSaved] = useState(new Date());
            
            // Speichern bei Änderungen
            useEffect(() => {
                localStorage.setItem('tsv-rot-courses', JSON.stringify(courses));
                localStorage.setItem('tsv-rot-trainers', JSON.stringify(trainers));
                setLastSaved(new Date());
            }, [courses, trainers]);
            
            // Statistiken berechnen
            const stats = useMemo(() => {
                const total = courses.length;
                const fullyStaffed = courses.filter(c => c.trainers.length >= c.required).length;
                const needsTrainers = total - fullyStaffed;
                const coverage = total > 0 ? Math.round((fullyStaffed / total) * 100) : 0;
                
                return { total, fullyStaffed, needsTrainers, coverage };
            }, [courses]);
            
            return (
                <div className="min-h-screen bg-gray-50">
                    {/* Header */}
                    <header className="bg-white shadow-sm border-b">
                        <div className="max-w-7xl mx-auto px-4 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold tsv-red">TSV ROT 1905</h1>
                                    <p className="text-sm text-gray-600">Trainer & Stundenplanung - Turnabteilung</p>
                                </div>
                                <div className="text-xs text-gray-500">
                                    Zuletzt gespeichert: {lastSaved.toLocaleTimeString('de-DE')}
                                </div>
                            </div>
                        </div>
                    </header>
                    
                    {/* Navigation */}
                    <nav className="bg-white border-b">
                        <div className="max-w-7xl mx-auto px-4">
                            <div className="flex space-x-8">
                                {['Dashboard', 'Kurse', 'Trainer', 'Wochenplan'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab.toLowerCase())}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                                            activeTab === tab.toLowerCase()
                                                ? 'border-red-600 text-red-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </nav>
                    
                    {/* Hauptinhalt */}
                    <main className="max-w-7xl mx-auto px-4 py-8">
                        {activeTab === 'dashboard' && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
                                
                                {/* Statistik-Karten */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                    <div className="bg-white rounded-lg shadow p-6 border-t-4 border-red-600">
                                        <h3 className="text-sm font-semibold text-gray-600 uppercase">Kurse gesamt</h3>
                                        <p className="text-3xl font-bold mt-2">{stats.total}</p>
                                    </div>
                                    <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-600">
                                        <h3 className="text-sm font-semibold text-gray-600 uppercase">Besetzt</h3>
                                        <p className="text-3xl font-bold mt-2 text-green-600">{stats.fullyStaffed}</p>
                                    </div>
                                    <div className="bg-white rounded-lg shadow p-6 border-t-4 border-orange-600">
                                        <h3 className="text-sm font-semibold text-gray-600 uppercase">Trainer fehlen</h3>
                                        <p className="text-3xl font-bold mt-2 text-orange-600">{stats.needsTrainers}</p>
                                    </div>
                                    <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-600">
                                        <h3 className="text-sm font-semibold text-gray-600 uppercase">Abdeckung</h3>
                                        <p className="text-3xl font-bold mt-2 text-blue-600">{stats.coverage}%</p>
                                    </div>
                                </div>
                                
                                {/* Quick Actions */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="font-semibold mb-4">Schnellzugriff</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <button className="p-4 bg-gray-50 rounded hover:bg-gray-100 transition">
                                            ➕ Neuer Kurs
                                        </button>
                                        <button className="p-4 bg-gray-50 rounded hover:bg-gray-100 transition">
                                            👤 Trainer hinzufügen
                                        </button>
                                        <button className="p-4 bg-gray-50 rounded hover:bg-gray-100 transition">
                                            📊 Bericht erstellen
                                        </button>
                                        <button className="p-4 bg-gray-50 rounded hover:bg-gray-100 transition">
                                            💾 Backup
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'kurse' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold">Kurse</h2>
                                    <button className="bg-tsv-red text-white px-4 py-2 rounded hover:bg-tsv-red-dark transition">
                                        ➕ Neuer Kurs
                                    </button>
                                </div>
                                
                                <div className="bg-white rounded-lg shadow overflow-hidden">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kurs</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zeit</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ort</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trainer</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {courses.map(course => (
                                                <tr key={course.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-medium">{course.name}</td>
                                                    <td className="px-6 py-4">{course.day}, {course.time}</td>
                                                    <td className="px-6 py-4">{course.location}</td>
                                                    <td className="px-6 py-4">
                                                        {course.trainers.length > 0 ? course.trainers.join(', ') : 
                                                         <span className="text-gray-400">Nicht besetzt</span>}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {course.trainers.length >= course.required ? 
                                                         <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">✅ Besetzt</span> :
                                                         <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">⚠️ Fehlt</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'trainer' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold">Trainer</h2>
                                    <button className="bg-tsv-red text-white px-4 py-2 rounded hover:bg-tsv-red-dark transition">
                                        ➕ Trainer hinzufügen
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {trainers.map(trainer => (
                                        <div key={trainer.id} className="bg-white rounded-lg shadow p-4">
                                            <h3 className="font-semibold text-lg">{trainer.name}</h3>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-600">Qualifikationen:</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {trainer.qualifications.map(q => (
                                                        <span key={q} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                                            {q}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-600">Verfügbar:</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {trainer.availability.map(day => (
                                                        <span key={day} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                                            {day}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'wochenplan' && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6">Wochenplan</h2>
                                <div className="bg-white rounded-lg shadow p-6">
                                    <p className="text-gray-600">Wochenplan-Ansicht kommt bald...</p>
                                </div>
                            </div>
                        )}
                    </main>
                    
                    {/* Footer */}
                    <footer className="mt-12 py-4 bg-white border-t">
                        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600">
                            © 2024 TSV Rot 1905 e.V. - Turnabteilung | Entwickelt mit ❤️ für unsere Trainer
                        </div>
                    </footer>
                </div>
            );
        }
        
        // App rendern
        ReactDOM.render(<TrainerApp />, document.getElementById('root'));
    </script>
</body>
</html>
'@ | Out-File -FilePath "index.html" -Encoding UTF8

Write-Host "✅ index.html erstellt" -ForegroundColor Green

# README.md
Write-Host "Erstelle README.md..." -ForegroundColor Yellow
@"
# TSV Rot 1905 - Trainer & Stundenplanung 🏃‍♂️

Eine moderne Web-App zur Verwaltung von Trainern und Trainingsstunden für die Turnabteilung des TSV Rot 1905 e.V.

## 🌟 Features

- 📊 **Dashboard** mit Übersicht aller wichtigen Kennzahlen
- 📅 **Kursverwaltung** - Alle Kurse auf einen Blick
- 👥 **Trainerverwaltung** - Trainer mit Qualifikationen und Verfügbarkeiten
- 📱 **Responsive Design** - Funktioniert auf allen Geräten
- 💾 **Automatisches Speichern** - Keine Daten gehen verloren

## 🚀 Live Demo

🌐 **[https://sissyhaegele.github.io/$RepoName](https://sissyhaegele.github.io/$RepoName)**

## 📖 Dokumentation

Siehe [Wiki](https://github.com/sissyhaegele/$RepoName/wiki) für detaillierte Anleitungen.

## 👥 Für TSV Rot Mitglieder

### Zugang zur App
1. Öffnen Sie den Link oben
2. Die App läuft direkt im Browser
3. Alle Änderungen werden automatisch gespeichert

### Support
Bei Fragen wenden Sie sich an die Abteilungsleitung Turnen.

## 📝 Lizenz

© 2024 TSV Rot 1905 e.V. - Alle Rechte vorbehalten.

---

**TSV Rot 1905 e.V. - Turnabteilung**  
*Bewegung schafft Lebensqualität seit 1905*
"@ | Out-File -FilePath "README.md" -Encoding UTF8

Write-Host "✅ README.md erstellt" -ForegroundColor Green

# .gitignore
Write-Host "Erstelle .gitignore..." -ForegroundColor Yellow
@'
# Windows
Thumbs.db
ehthumbs.db
Desktop.ini
$RECYCLE.BIN/

# macOS
.DS_Store
.AppleDouble
.LSOverride

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Logs
logs
*.log
npm-debug.log*

# Backup files
*.bak
*.backup
backup/

# Temporary files
*.tmp
*.temp
~$*

# GitHub Desktop
*.orig
'@ | Out-File -FilePath ".gitignore" -Encoding UTF8

Write-Host "✅ .gitignore erstellt" -ForegroundColor Green

# GitHub Actions Workflow
Write-Host "Erstelle GitHub Actions Workflow..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path ".github\workflows" -Force | Out-Null

@'
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
'@ | Out-File -FilePath ".github\workflows\deploy.yml" -Encoding UTF8

Write-Host "✅ GitHub Actions Workflow erstellt" -ForegroundColor Green

# ============================================================================
# SCHRITT 4: Git Commit vorbereiten
# ============================================================================

Write-Step "💾 Schritt 4: Dateien für Commit vorbereiten"

# Alle Dateien zum Git Index hinzufügen
git add -A
Write-Host "✅ Alle Dateien zum Git Index hinzugefügt" -ForegroundColor Green

# Status anzeigen
Write-Host "`nGit Status:" -ForegroundColor Yellow
git status --short

# ============================================================================
# SCHRITT 5: Repository auf GitHub erstellen (optional)
# ============================================================================

if ($CreateRepo) {
    Write-Step "🚀 Schritt 5: GitHub Repository erstellen"
    
    Write-Host "Erstelle Repository auf GitHub..." -ForegroundColor Yellow
    
    # Prüfe ob GitHub CLI installiert ist
    if (Get-Command gh -ErrorAction SilentlyContinue) {
        gh repo create $RepoName --public --source=. --remote=origin --push
        Write-Host "✅ Repository erstellt und gepusht" -ForegroundColor Green
    } else {
        Write-Host @"

⚠️  GitHub CLI nicht installiert. Bitte manuell erstellen:

1. Öffnen Sie: https://github.com/new
2. Repository Name: $RepoName
3. Public Repository
4. NICHT initialisieren (kein README, .gitignore oder License)
5. Create Repository

Dann in GitHub Desktop:
1. File → Add Local Repository
2. Wählen Sie: $ProjectPath
3. Publish Repository

"@ -ForegroundColor Yellow
    }
} else {
    Write-Host @"

📌 Nächste Schritte in GitHub Desktop:

1. Öffnen Sie GitHub Desktop
2. File → Add Local Repository
3. Choose: $ProjectPath
4. Repository sollte erscheinen mit uncommitted changes
5. Commit Message: "Initial commit: TSV Rot Trainer-App"
6. Commit to main
7. Publish repository (oben rechts)
   - Name: $RepoName
   - Keep this code private: NEIN (unchecked)
   - Publish Repository

"@ -ForegroundColor Yellow
}

# ============================================================================
# SCHRITT 6: Lokale Test-Datei erstellen
# ============================================================================

Write-Step "🧪 Schritt 6: Test-Skript erstellen"

@"
# TSV Rot Trainer-App - Lokaler Test

Write-Host "🧪 Teste TSV Rot Trainer-App..." -ForegroundColor Cyan

# Öffne im Standard-Browser
Start-Process "$ProjectPath\index.html"

Write-Host "✅ App geöffnet im Browser" -ForegroundColor Green
Write-Host ""
Write-Host "GitHub Pages URL (nach Deployment):" -ForegroundColor Yellow
Write-Host "https://sissyhaegele.github.io/$RepoName" -ForegroundColor White
"@ | Out-File -FilePath "test-local.ps1" -Encoding UTF8

Write-Host "✅ test-local.ps1 erstellt" -ForegroundColor Green

# ============================================================================
# ZUSAMMENFASSUNG
# ============================================================================

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "     ✅ SETUP ERFOLGREICH ABGESCHLOSSEN!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green

Write-Host @"

📁 Projekt-Pfad:
   $ProjectPath

📝 Erstellte Dateien:
   ✅ index.html (Hauptanwendung)
   ✅ README.md (Dokumentation)
   ✅ .gitignore (Git-Konfiguration)
   ✅ .github/workflows/deploy.yml (Auto-Deployment)
   ✅ test-local.ps1 (Lokaler Test)

🎯 Nächste Schritte:

1️⃣  GITHUB DESKTOP:
    • Öffnen Sie GitHub Desktop
    • Add Local Repository → $ProjectPath
    • Commit: "Initial commit: TSV Rot Trainer-App"
    • Publish Repository als "$RepoName"

2️⃣  GITHUB PAGES AKTIVIEREN:
    Nach dem Push:
    • https://github.com/sissyhaegele/$RepoName/settings/pages
    • Source: Deploy from a branch
    • Branch: main
    • Folder: / (root)
    • Save

3️⃣  APP TESTEN:
    Lokal:  Doppelklick auf index.html
    Online: https://sissyhaegele.github.io/$RepoName (nach ~5 Min)

📌 Repository URL:
   https://github.com/sissyhaegele/$RepoName

"@ -ForegroundColor Cyan

# Lokalen Test anbieten
$test = Read-Host "Möchten Sie die App jetzt lokal testen? (j/n)"
if ($test -eq 'j') {
    Start-Process "$ProjectPath\index.html"
    Write-Host "✅ App wurde im Browser geöffnet" -ForegroundColor Green
}

Write-Host "`nViel Erfolg mit der TSV Rot Trainer-App! 🎉" -ForegroundColor Green