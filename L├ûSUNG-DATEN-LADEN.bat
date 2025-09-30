@echo off
echo =====================================
echo TSV ROT - DATEN PROBLEM LÖSUNG
echo =====================================
echo.
echo Dieses Script behebt das Daten-Problem!
echo.

REM Prüfen ob npm installiert ist
if not exist node_modules (
    echo Installiere App zuerst...
    call npm install
)

echo.
echo Starte App und lade echte TSV Rot Daten...
echo.

REM Server im Hintergrund starten
start /min cmd /c "npm run dev"

REM Kurz warten bis Server läuft
timeout /t 3 /nobreak > nul

REM Direkt die Daten-Laden Seite öffnen
echo Öffne Daten-Laden Seite...
start http://localhost:5173/DATEN-LADEN.html

echo.
echo =====================================
echo WICHTIG: 
echo 1. Browser öffnet sich gleich
echo 2. Klicken Sie auf den ROTEN Button
echo 3. Die echten TSV Rot Daten werden geladen
echo 4. App startet automatisch mit allen Daten!
echo =====================================
echo.
pause
