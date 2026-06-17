@echo off
cd /d "%~dp0apps\desktop"
echo === SocialKit Desktop (Dev Mode with DevTools) ===
echo.

echo Building main process...
call npx tsc
if %errorlevel% neq 0 (
    echo TypeScript build failed
    pause
    exit /b %errorlevel%
)
echo OK

echo Starting Vite dev server + Electron...
set NODE_ENV=development
start "" "node_modules\.bin\concurrently.cmd" --kill-others "npx vite" "npx wait-on http://localhost:5173 && npx electron ."
echo DevTools should open automatically. Close all windows to exit.
exit /b 0
