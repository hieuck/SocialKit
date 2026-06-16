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

echo Starting with DevTools...
set NODE_ENV=development
start "" "node_modules\.bin\electron.cmd" .
echo DevTools should open automatically. Close Electron window to exit.
exit /b 0
