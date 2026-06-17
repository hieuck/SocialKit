@echo off
cd /d "%~dp0apps\desktop"
echo === SocialKit Desktop ===
echo.
echo Building...
call npx tsc && npx vite build
if %errorlevel% neq 0 (
    echo Build failed
    pause
    exit /b %errorlevel%
)
set NODE_ENV=production
start "" "node_modules\.bin\electron.cmd" .
exit /b 0
