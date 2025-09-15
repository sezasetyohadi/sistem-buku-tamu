# Sistem Buku Tamu - Server Stopper
Write-Host "=====================================" -ForegroundColor Red
Write-Host "Stopping Sistem Buku Tamu Servers" -ForegroundColor Red
Write-Host "=====================================" -ForegroundColor Red
Write-Host ""

Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow
try {
    $processes = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($processes) {
        $processes | Stop-Process -Force
        Write-Host "Node.js processes stopped successfully." -ForegroundColor Green
    } else {
        Write-Host "No Node.js processes found." -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error stopping processes: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Servers stopped." -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to close"