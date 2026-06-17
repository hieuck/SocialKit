@echo off
cd /d "%~dp0apps\desktop"
echo === SocialKit Desktop ===

where npx >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

echo [1/2] Building...
npx tsc
if errorlevel 1 (
    echo [BUILD FAILED] TypeScript error
    pause
    exit /b 1
)
npx vite build
if errorlevel 1 (
    echo [BUILD FAILED] Vite error
    pause
    exit /b 1
)

echo [2/2] Launching...
set NODE_ENV=production
start "SocialKit Desktop" cmd /c "node_modules\.bin\electron.cmd ."
echo Desktop launched. Close the Electron window to stop.
echo.
pause >nul
