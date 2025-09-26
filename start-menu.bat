@echo off
title Soundboard Starter
color 09

:MENU
cls
echo ==========================================
echo         SOUNDBOARD - STARTER
echo ==========================================
echo.
echo   1) DEV starten   (Port 5173)
echo   2) BUILD + PROD  (Port 3000)
echo   3) Nur BUILD erstellen
echo   4) Beenden
echo.
choice /C 1234 /N /M "Waehle [1-4]: "

if %ERRORLEVEL% EQU 1 goto DEV
if %ERRORLEVEL% EQU 2 goto PROD
if %ERRORLEVEL% EQU 3 goto BUILD
if %ERRORLEVEL% EQU 4 exit

:DEV
cls
color 0A
cd /d C:\Projekte\soundboard
echo ==========================================
echo    DEVELOPMENT - http://localhost:5173
echo ==========================================
echo.
call yarn dev
pause
goto MENU

:PROD
cls
color 0B
cd /d C:\Projekte\soundboard
echo ==========================================
echo    PRODUCTION - http://localhost:3000
echo ==========================================
echo.
echo Building...
call yarn build
echo.
echo Starting production server...
call npx serve -s dist -l 3000
pause
goto MENU

:BUILD
cls
color 0E
cd /d C:\Projekte\soundboard
echo ==========================================
echo    BUILD ONLY
echo ==========================================
echo.
call yarn build
echo.
echo Build complete! Files in: dist/
pause
goto MENU