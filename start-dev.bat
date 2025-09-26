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
