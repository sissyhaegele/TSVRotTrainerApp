@echo off
echo =====================================
echo TSV 1905 ROT - TURNABTEILUNG
echo =====================================
echo.
echo Echte Vereinsdaten sind bereits integriert!
echo.

REM Alte Installation loeschen
if exist node_modules (
    echo Loesche alte Installation...
    rmdir /s /q node_modules 2>nul
    del package-lock.json 2>nul
)

REM Installieren
echo [1/2] Installiere App...
call npm install

REM Browser oeffnen
echo.
echo [2/2] Starte App mit echten TSV Rot Daten...
timeout /t 2 /nobreak > nul
start http://localhost:5173

REM App starten
call npm run dev
