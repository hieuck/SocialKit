@echo off
cd /d "%~dp0apps\desktop"
echo === SocialKit Desktop (Dev Mode with DevTools) ===
echo.
echo [1/2] Building main process...
call npx tsc
if %errorlevel% neq 0 (
    echo TypeScript build failed
    pause
    exit /b %errorlevel%
)
echo OK
echo [2/2] Starting Vite + Electron...
set NODE_ENV=development
start "SocialKit Dev" cmd /c "npx concurrently --kill-others "npx vite" "npx wait-on http://localhost:5173 && npx electron .""
echo DevTools should open in the new window.
exit /b 0
