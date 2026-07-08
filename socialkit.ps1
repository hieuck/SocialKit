# SocialKit Desktop — PowerShell script
# Right-click → "Run with PowerShell" or run: .\socialkit.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$desktop = Join-Path $root "apps\desktop"

Write-Host "=== SocialKit Desktop ==="
Write-Host "[1/2] Building..."
Set-Location $desktop

npx tsc
if (-not $?) { Write-Host "BUILD FAILED"; Read-Host; exit 1 }

npx vite build
if (-not $?) { Write-Host "BUILD FAILED"; Read-Host; exit 1 }

Write-Host "[2/2] Launching..."
$env:NODE_ENV = "production"
Start-Process "npx" -ArgumentList "electron ." -WorkingDirectory $desktop -WindowStyle Normal

Write-Host "Desktop launched. Close the Electron window to stop."
Read-Host "Press Enter to close this terminal"
