# start_showcase.ps1
# Starts Backend (port 8000), Frontend (port 5173), and Cloudflare Tunnel

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  Starting Smart Growth Tracker + Public Tunnel  " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Backend
Write-Host "[1/3] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\backend'; Write-Host '--- FASTAPI BACKEND (Port 8000) ---' -ForegroundColor Green; & '.\venv\Scripts\uvicorn.exe' app.main:app --host 127.0.0.1 --port 8000"

# 2. Frontend
Start-Sleep -Seconds 1
Write-Host "[2/3] Starting Vite Frontend on http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\frontend'; Write-Host '--- VITE FRONTEND (Port 5173) ---' -ForegroundColor Green; npm run dev"

# 3. Tunnel
Start-Sleep -Seconds 2
Write-Host "[3/3] Starting Cloudflare Public HTTPS Tunnel..." -ForegroundColor Yellow
$cloudflaredPath = if (Test-Path "$HOME\cloudflared.exe") { "$HOME\cloudflared.exe" } else { "cloudflared" }
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '--- CLOUDFLARE PUBLIC TUNNEL ---' -ForegroundColor Magenta; & '$cloudflaredPath' tunnel --url http://localhost:5173"

Write-Host ""
Write-Host "-------------------------------------------------" -ForegroundColor Green
Write-Host " All 3 processes launched in dedicated windows!  " -ForegroundColor Green
Write-Host " Check the Cloudflare window for your public link" -ForegroundColor Cyan
Write-Host " (https://<random-name>.trycloudflare.com)       " -ForegroundColor Cyan
Write-Host " To stop all services anytime, run:              " -ForegroundColor Gray
Write-Host "   .\stop_showcase.ps1                           " -ForegroundColor Gray
Write-Host "-------------------------------------------------" -ForegroundColor Green
