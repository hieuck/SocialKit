@echo off
cd /d "%~dp0apps\desktop"
echo === SocialKit Desktop ===
echo [1/2] Building...
call npx tsc
if %errorlevel% neq 0 ( echo BUILD FAILED & pause & exit /b 1 )
call npx vite build
if %errorlevel% neq 0 ( echo BUILD FAILED & pause & exit /b 1 )
echo [2/2] Launching...
set NODE_ENV=production
start "" "node_modules\.bin\electron.cmd" .
echo Done.
pause >nul
