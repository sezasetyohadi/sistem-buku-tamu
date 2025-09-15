# Sistem Buku Tamu - Production Server Launcher
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Sistem Buku Tamu - Production Server" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Function to get network IP
function Get-NetworkIP {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.PrefixOrigin -eq 'Dhcp' -and $_.SuffixOrigin -eq 'Dhcp'}).IPAddress
    return $ip
}

$networkIP = Get-NetworkIP

Write-Host "Building application..." -ForegroundColor Yellow
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed"
    }
    Write-Host "Build completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Build failed: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Starting production servers..." -ForegroundColor Yellow
Write-Host ""

# Start Guest Portal
Write-Host "Starting Guest Portal (Port 3000)..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run start:guest" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Admin Panel  
Write-Host "Starting Admin Panel (Port 3001)..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run start:admin" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Servers started successfully!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Guest Portal: http://localhost:3000" -ForegroundColor White
Write-Host "Admin Panel:  http://localhost:3001" -ForegroundColor White
if ($networkIP) {
    Write-Host "Network Access:" -ForegroundColor Yellow
    Write-Host "  Guest Portal: http://${networkIP}:3000" -ForegroundColor White
    Write-Host "  Admin Panel:  http://${networkIP}:3001" -ForegroundColor White
}
Write-Host ""
Write-Host "To stop servers, run: .\stop-server.ps1" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to close this window"