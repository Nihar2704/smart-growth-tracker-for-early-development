# stop_showcase.ps1
# Stops all running instances of cloudflared, node (Vite), and uvicorn (FastAPI)

Write-Host "Stopping Smart Growth Tracker services..." -ForegroundColor Yellow

$stopped = 0

$processes = Get-Process -Name cloudflared, node, uvicorn -ErrorAction SilentlyContinue
if ($processes) {
    $processes | ForEach-Object {
        Write-Host "  Terminating $($_.ProcessName) (PID: $($_.Id))..." -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        $stopped++
    }
    Write-Host "Done! Stopped $stopped process(es)." -ForegroundColor Green
} else {
    Write-Host "No active background services found." -ForegroundColor Yellow
}
