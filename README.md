# TSV Rot Trainer & Kursverwaltung

Eine moderne Web-App zur Verwaltung von Trainern und Kursen für den TSV 1905 Rot e.V.

## 🚀 Features

- **Trainer-Soll Management**: Definierbare Anzahl benötigter Trainer pro Kurs (1-5)
- **Vertretungsmanagement**: Flexible Vertretungsplanung mit allen verfügbaren Trainern
- **Besetzungsübersicht**: Farbcodierte Statusanzeige (Grün/Gelb/Rot/Blau)
- **Delta-Berechnung**: Automatische Berechnung von Soll vs. Ist
- **Wochenplan**: Übersichtliche Darstellung aller Kurse
- **Anwesenheitsverfolgung**: Erfassung der Trainer-Anwesenheit pro Einheit

## 📋 Voraussetzungen

- Node.js 16+ 
- npm oder yarn

## 🔧 Installation

### 1. Projekt herunterladen und entpacken

```bash
# Entpacken Sie die ZIP-Datei
# Navigieren Sie zum Projektordner
cd TSVRotTrainer
```

### 2. Abhängigkeiten installieren

```bash
npm install
# oder
yarn install
```

### 3. Entwicklungsserver starten

```bash
npm run dev
# oder
yarn dev
```

Die App ist dann unter http://localhost:5173 verfügbar.

## 🏗️ Build für Produktion

```bash
npm run build
# oder
yarn build
```

Die fertige App wird im `dist` Ordner erstellt.

### Produktion starten

```bash
npm run preview
# oder
yarn preview
```

## 📁 Projektstruktur

```
TSVRotTrainer/
├── src/
│   ├── components/
│   │   ├── Courses.jsx          # Kursverwaltung mit Trainer-Soll
│   │   ├── Trainers.jsx         # Trainerverwaltung
│   │   ├── StaffingOverview.jsx # Besetzungsübersicht
│   │   ├── WeeklyView.jsx       # Wochenplan mit Vertretungen
│   │   └── TrainingSessions.jsx # Trainingseinheiten
│   ├── App.jsx                  # Hauptkomponente
│   ├── main.jsx                 # Einstiegspunkt
│   └── index.css                # Tailwind CSS
├── public/
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎨 Technologie-Stack

- **React 18** - UI Framework
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Vite** - Build Tool
- **LocalStorage** - Datenspeicherung

## 💾 Datenspeicherung

Die App speichert alle Daten lokal im Browser (localStorage). Die Daten bleiben erhalten, auch wenn Sie den Browser schließen.

### Daten exportieren/importieren

Die Daten werden unter folgenden Keys gespeichert:
- `tsvrot-courses` - Kurse
- `tsvrot-trainers` - Trainer
- `tsvrot-sessions` - Trainingseinheiten

## 🔄 Migration bestehender Daten

Falls Sie bereits Daten haben, können Sie diese über die Browser-Konsole migrieren:

```javascript
// Daten exportieren
const data = {
  courses: JSON.parse(localStorage.getItem('tsvrot-courses') || '[]'),
  trainers: JSON.parse(localStorage.getItem('tsvrot-trainers') || '[]'),
  sessions: JSON.parse(localStorage.getItem('tsvrot-sessions') || '[]')
};
console.log(JSON.stringify(data));

// Daten importieren
const importData = {...}; // Ihre Daten hier
localStorage.setItem('tsvrot-courses', JSON.stringify(importData.courses));
localStorage.setItem('tsvrot-trainers', JSON.stringify(importData.trainers));
localStorage.setItem('tsvrot-sessions', JSON.stringify(importData.sessions));
location.reload();
```

## 🚀 Deployment

### Azure Static Web Apps

```bash
# Build erstellen
npm run build

# Mit Azure CLI deployen
az staticwebapp create \
  --name TSVRotTrainer \
  --resource-group TSVRot \
  --source ./dist \
  --location "westeurope"
```

### Andere Hosting-Dienste

Der `dist` Ordner kann auf jeden statischen Webserver deployed werden:
- Netlify
- Vercel  
- GitHub Pages
- Nginx/Apache

## 🐛 Fehlerbehebung

### Port bereits belegt
```bash
# Anderen Port verwenden
npm run dev -- --port 3000
```

### Build-Fehler
```bash
# Cache löschen und neu installieren
rm -rf node_modules package-lock.json
npm install
```

## 📝 Lizenz

© 2024 TSV 1905 Rot e.V. - Alle Rechte vorbehalten

## 👥 Support

Bei Fragen oder Problemen wenden Sie sich an die Turnabteilung des TSV Rot.
