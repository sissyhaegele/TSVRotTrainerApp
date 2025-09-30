@echo off
echo =====================================
echo TSV ROT TRAINER - SOFORT START
echo =====================================
echo.
echo LOESCHT CACHE UND STARTET NEU
echo.

REM Cache und alte Daten loeschen
echo [1/4] Loesche Browser-Speicher...
powershell -Command "Remove-Item -Path '%LOCALAPPDATA%\npm-cache' -Recurse -Force -ErrorAction SilentlyContinue"

REM Alte node_modules loeschen falls vorhanden
echo [2/4] Loesche alte Installation...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

REM Neu installieren
echo [3/4] Installiere frisch...
call npm cache clean --force
call npm install

REM Port 5173 freigeben falls belegt
echo [4/4] Starte App...
taskkill /F /IM node.exe 2>nul

REM Browser oeffnen
timeout /t 2 /nobreak > nul
start http://localhost:5173

REM App starten
call npm run dev

pause
