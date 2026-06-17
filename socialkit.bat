@echo off
cd /d "%~dp0apps\desktop"
echo === SocialKit Desktop ===
echo.
echo [1/2] Building...
call npx tsc
if %errorlevel% neq 0 (
    echo ERROR: Build failed (tsc)
    pause
    exit /b %errorlevel%
)
call npx vite build
if %errorlevel% neq 0 (
    echo ERROR: Build failed (vite)
    pause
    exit /b %errorlevel%
)
echo [2/2] Launching...
set NODE_ENV=production
start "SocialKit Desktop" cmd /c "node_modules\.bin\electron.cmd ."
echo Desktop launched. Close the Electron window to stop.
echo You can close this terminal window.
pause
exit /b 0
