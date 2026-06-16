@echo off
cd /d "%~dp0apps\desktop"
echo Building SocialKit Desktop...
call npx tsc
if %errorlevel% neq 0 (
    echo TypeScript build failed. Press any key to exit.
    pause >nul
    exit /b %errorlevel%
)
call npx vite build
if %errorlevel% neq 0 (
    echo Vite build failed. Press any key to exit.
    pause >nul
    exit /b %errorlevel%
)
echo Launching SocialKit Desktop...
start npx electron .
exit /b 0
