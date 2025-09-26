# TSV Rot React App - Azure Deployment Guide

## 🚀 Deployment zur bestehenden Azure-Infrastruktur

Diese Anleitung zeigt, wie Sie die neue React-App zu Ihrer **bestehenden Azure-Infrastruktur** hinzufügen.

## 🔧 **Voraussetzungen**

### Bestehende Azure-Ressourcen (bereits vorhanden)
- ✅ **Resource Group**: `TSVRot`
- ✅ **Web App**: `TSVRot2025` (`https://trainer.tsvrot.de`)
- ✅ **MySQL Server**: `tsvrot2025-server.mysql.database.azure.com`
- ✅ **Datenbank**: `tsvrot2025-database`
- ✅ **Custom Domain**: `trainer.tsvrot.de` mit SSL

### Neue Komponenten hinzufügen
- ✅ **React Build**: Statische Dateien für die Web App
- ✅ **PHP API**: Erweiterte API-Endpunkte
- ✅ **Echte Daten**: TSV Rot Trainer und Kurse

## 📝 **Schritt 1: Datenbank mit echten Daten füllen**

### Option A: Azure Portal Query Editor
1. **Azure Portal** öffnen → `tsvrot2025-server` → **Query Editor**
2. **Login**: `flfhdqzgsh` / `HalloTSVRot2025`
3. **SQL-Script** aus `database/tsv-rot-data.sql` kopieren und ausführen
4. **Prüfung**: Sollte zeigen: 9 Trainer, 7 Kurse eingefügt

### Option B: MySQL Workbench
```bash
# Verbindung herstellen
Host: tsvrot2025-server.mysql.database.azure.com
Port: 3306
User: flfhdqzgsh
Password: HalloTSVRot2025
Database: tsvrot2025-database

# SSL aktivieren!
```

### Option C: PowerShell mit MySQL CLI
```powershell
# MySQL CLI installieren (falls nicht vorhanden)
winget install Oracle.MySQL

# Verbinden und Script ausführen
mysql -h tsvrot2025-server.mysql.database.azure.com -u flfhdqzgsh -p tsvrot2025-database < database/tsv-rot-data.sql
```

## 📦 **Schritt 2: React App builden**

```powershell
cd C:\Projekte\tsv-rot-react

# Production Build erstellen
yarn build

# Prüfen dass dist/ Ordner erstellt wurde
ls dist/
```

**Build sollte enthalten:**
- `index.html` - Haupt-HTML
- `assets/` - JS/CSS/Images
- Optimiert und komprimiert

## 🌐 **Schritt 3: PHP API zu Azure Web App hinzufügen**

### Via Azure CLI
```powershell
# Login (falls nötig)
az login

# API-Dateien hochladen
az webapp deployment source config-zip `
    --resource-group "TSVRot" `
    --name "TSVRot2025" `
    --src "api.zip"
```

### Via FTP/Kudu
1. **Kudu Console**: `https://tsvrot2025.scm.azurewebsites.net`
2. **Dateien** in `/site/wwwroot/api/` hochladen:
   - `api/index.php` → `/site/wwwroot/api/index.php`

### Via VS Code Azure Extension
1. **Azure Extension** installieren
2. **Resource** `TSVRot2025` auswählen
3. **Deploy** → `api/` Ordner auswählen

## 📱 **Schritt 4: React App zu Azure Web App deployen**

### Vollständiges Replacement (Empfohlen)
```powershell
# Komplett neues Deployment
Compress-Archive -Path "dist\*" -DestinationPath "build.zip"

az webapp deployment source config-zip `
    --resource-group "TSVRot" `
    --name "TSVRot2025" `
    --src "build.zip"
```

### Nur Frontend updaten (Alternative)
```powershell
# Nur React-Build deployen, API beibehalten
cd dist
Compress-Archive -Path "*" -DestinationPath "../frontend.zip"
cd ..

# Upload zu wwwroot/ (nicht api/)
az webapp deployment source config-zip `
    --resource-group "TSVRot" `
    --name "TSVRot2025" `
    --src "frontend.zip" `
    --target-path "/site/wwwroot/"
```

## ⚙️ **Schritt 5: Web App Konfiguration**

### PHP Runtime aktivieren
```powershell
# PHP 8.2 aktivieren (für API)
az webapp config set `
    --resource-group "TSVRot" `
    --name "TSVRot2025" `
    --php-version "8.2"

# Index-Dokument setzen
az webapp config set `
    --resource-group "TSVRot" `
    --name "TSVRot2025" `
    --startup-file "index.html"
```

### App Settings konfigurieren
```powershell
# Datenbank-Verbindung (sollte schon gesetzt sein)
az webapp config appsettings set `
    --resource-group "TSVRot" `
    --name "TSVRot2025" `
    --settings `
        DB_HOST="tsvrot2025-server.mysql.database.azure.com" `
        DB_USER="flfhdqzgsh" `
        DB_PASSWORD="HalloTSVRot2025" `
        DB_NAME="tsvrot2025-database"
```

### SSL und Domain (bereits konfiguriert)
- ✅ Custom Domain: `trainer.tsvrot.de` 
- ✅ SSL Certificate: Azure Managed Certificate
- ✅ HTTPS Redirect: Aktiv

## 🧪 **Schritt 6: Testing**

### 1. **Grundfunktion testen**
```bash
# Webseite erreichbar?
curl -I https://trainer.tsvrot.de
# Sollte: 200 OK zurückgeben
```

### 2. **API-Endpoints testen**
```bash
# Login testen
curl -X POST https://trainer.tsvrot.de/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"TSVAdmin2024"}'

# Trainer-Liste abrufen (mit Token)
curl -X GET https://trainer.tsvrot.de/api/trainers \
  -H "Authorization: Bearer TSVAdmin2024"
```

### 3. **Browser-Test**
1. **https://trainer.tsvrot.de** öffnen
2. **Login**: `TSVAdmin2024` (Admin) oder `TSVRot2024` (Trainer)
3. **Trainer-Seite** → Sollte 9 Trainer anzeigen
4. **Kurse-Seite** → Sollte 7 Kurse anzeigen
5. **Alle Buttons** testen!

## 🔍 **Schritt 7: Troubleshooting**

### Häufige Probleme

| Problem | Lösung |
|---------|---------|
| **"Index.html not found"** | `az webapp restart --resource-group TSVRot --name TSVRot2025` |
| **"API 404 Error"** | PHP Runtime aktivieren, api/index.php prüfen |
| **"Database Connection Failed"** | App Settings für DB prüfen |
| **"CORS Error"** | API-Headers prüfen, gleiche Domain nutzen |
| **"Login funktioniert nicht"** | Passwörter in API prüfen |

### Logs anzeigen
```powershell
# Live-Logs anzeigen
az webapp log tail --resource-group "TSVRot" --name "TSVRot2025"

# Log-Stream aktivieren
az webapp log config `
    --resource-group "TSVRot" `
    --name "TSVRot2025" `
    --application-logging filesystem `
    --level information
```

### Kudu Debug Console
1. **https://tsvrot2025.scm.azurewebsites.net** öffnen
2. **Debug Console** → **CMD**
3. **Dateistruktur prüfen**:
   ```
   /site/wwwroot/
   ├── index.html          # React App
   ├── assets/             # CSS/JS
   └── api/
       └── index.php       # API
   ```

## ✅ **Schritt 8: Verifikation**

Nach erfolgreichem Deployment sollten Sie haben:

### **Funktionsfähige Anwendung**
- ✅ **Login**: Admin & Trainer Zugang
- ✅ **Trainer-CRUD**: Hinzufügen, bearbeiten, löschen
- ✅ **Kurs-CRUD**: Vollständige Kursverwaltung  
- ✅ **Qualifikationen**: Zuordnung funktioniert
- ✅ **Wochenplan**: Trainer-Zuweisung
- ✅ **Responsive**: Mobile + Desktop

### **Echte Daten geladen**
- ✅ **9 Trainer**: Desiree Knopf, Sarah Winkler, Julia Miller, etc.
- ✅ **7 Kurse**: Frauengymnastik, Turnzwerge, Kinderturnen, etc.
- ✅ **Zuordnungen**: Trainer haben passende Kurse
- ✅ **Qualifikationen**: Realistische Trainer-Profile

### **Performance & Sicherheit**
- ✅ **HTTPS**: SSL-verschlüsselt
- ✅ **Custom Domain**: trainer.tsvrot.de
- ✅ **Authentication**: Token-basiert
- ✅ **Fast Loading**: Vite-optimiert

## 🎉 **Deployment abgeschlossen!**

Ihre neue **TSV Rot React Trainer-App** ist jetzt live und nutzt:

- **Bestehende Azure-Infrastruktur** 
- **Echte TSV Rot Daten**
- **Alle fehlenden Admin-Features**
- **Moderne React-Architektur**

**Die App ist bereit für den produktiven Einsatz! 🚀**

---

## 📞 **Support**

Bei Deployment-Problemen:
- **E-Mail**: sissy.haegele@tsvrot.de
- **Logs prüfen**: `az webapp log tail`
- **Kudu Console**: https://tsvrot2025.scm.azurewebsites.net
