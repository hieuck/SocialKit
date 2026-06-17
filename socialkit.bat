@echo off
cd /d "%~dp0apps\desktop"
echo === SocialKit Desktop ===
echo.

echo [1/3] Building main process (tsc)...
call npx tsc
if %errorlevel% neq 0 (
    echo ERROR: TypeScript build failed
    pause
    exit /b %errorlevel%
)
echo OK

echo [2/3] Building renderer (vite)...
call npx vite build
if %errorlevel% neq 0 (
    echo ERROR: Vite build failed
    pause
    exit /b %errorlevel%
)
echo OK

echo [3/3] Launching Electron...
if not exist "dist\preload\index.js" (
    echo WARNING: preload script not found at dist/preload/index.js
)
if not exist "dist\main\index.js" (
    echo ERROR: main process not found at dist/main/index.js
    pause
    exit /b 1
)
if not exist "dist\renderer\index.html" (
    echo ERROR: renderer not found at dist/renderer/index.html
    pause
    exit /b 1
)

set NODE_ENV=production
start "" "node_modules\.bin\electron.cmd" .
echo Desktop launched. Close the Electron window to exit.
exit /b 0
