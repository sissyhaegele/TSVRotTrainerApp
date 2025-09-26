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

\\\ash
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
\\\

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

\\\
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
\\\

## 🚀 Deployment

### Azure Web App Deployment

\\\ash
# Build für Production
yarn build

# Build-Ordner zu Azure deployen
# (Verwendet bestehende Azure-Infrastruktur)
\\\

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
