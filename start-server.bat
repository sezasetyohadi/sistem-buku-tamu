@echo off
echo ====================================
echo Sistem Buku Tamu - Production Server
echo ====================================
echo.

echo Building application...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo Starting production servers...
echo.

echo Starting Guest Portal (Port 3000)...
start "Guest Portal" cmd /k "cd /d %~dp0 && npm run start:guest"

echo Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo Starting Admin Panel (Port 3001)...
start "Admin Panel" cmd /k "cd /d %~dp0 && npm run start:admin"

echo.
echo ====================================
echo Servers started successfully!
echo ====================================
echo Guest Portal: http://localhost:3000
echo Admin Panel:   http://localhost:3001
echo Network IP:    http://192.168.104.189:3000
echo Network IP:    http://192.168.104.189:3001
echo.
echo Press any key to close this window...
pause >nul