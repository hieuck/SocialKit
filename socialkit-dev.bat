@echo off
cd /d "%~dp0apps\desktop"
echo === SocialKit Desktop (Dev Mode) ===

where npx >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

echo [1/2] Building main process...
npx tsc
if errorlevel 1 (
    echo [BUILD FAILED]
    pause
    exit /b 1
)

echo [2/2] Starting Vite dev server + Electron with DevTools...
set NODE_ENV=development
start "SocialKit Dev" cmd /c "npx concurrently --kill-others "npx vite" "npx wait-on http://localhost:5173 && npx electron .""
echo Dev mode started in new window. Close all windows to stop.
echo.
pause >nul
