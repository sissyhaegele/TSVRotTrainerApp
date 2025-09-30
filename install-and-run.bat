@echo off
echo =====================================
echo TSV Rot Trainer App - Installation
echo =====================================
echo.

echo [1/3] Installiere Abhaengigkeiten...
call npm install

echo.
echo [2/3] Starte Entwicklungsserver...
echo.
echo Die App wird gleich im Browser unter http://localhost:5173 geoeffnet
echo.
timeout /t 3 /nobreak > nul

start http://localhost:5173

echo [3/3] Server laeuft...
call npm run dev

pause
