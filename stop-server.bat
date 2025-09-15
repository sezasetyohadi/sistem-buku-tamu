@echo off
echo ====================================
echo Stopping Sistem Buku Tamu Servers
echo ====================================

echo Stopping all Node.js processes...
taskkill /f /im node.exe 2>nul
if %errorlevel% equ 0 (
    echo Node.js processes stopped successfully.
) else (
    echo No Node.js processes found.
)

echo.
echo Servers stopped.
echo.
pause