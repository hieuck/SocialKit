@echo off
cd /d "%~dp0apps\desktop"
echo Building main process...
call npx tsc
if %errorlevel% neq 0 (
    echo TypeScript build failed. Press any key to exit.
    pause >nul
    exit /b %errorlevel%
)
echo Starting SocialKit Desktop (dev mode)...
start npx concurrently --kill-others "npx vite" "npx wait-on http://localhost:5173 && npx electron ."
exit /b 0
