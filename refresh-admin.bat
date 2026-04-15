@echo off
REM Refresh Admin Button Script for Windows
REM This script automates the complete refresh process

echo 🔄 Egypt Advisor Tours - Admin Button Refresh
echo ==============================================
echo.

REM Step 1: Pull latest changes
echo 📥 Step 1: Pulling latest changes...
git pull origin main 2>nul || git pull origin copilot/remove-video-from-hero
echo ✅ Latest changes pulled
echo.

REM Step 2: Clean node_modules
echo 🧹 Step 2: Cleaning old dependencies...
if exist node_modules rmdir /s /q node_modules 2>nul
if exist client\node_modules rmdir /s /q client\node_modules 2>nul
if exist server\node_modules rmdir /s /q server\node_modules 2>nul
if exist client\build rmdir /s /q client\build 2>nul
if exist client\.cache rmdir /s /q client\.cache 2>nul
echo ✅ Cleaned successfully
echo.

REM Step 3: Reinstall dependencies
echo 📦 Step 3: Installing fresh dependencies...
call npm run install:all
echo ✅ Dependencies installed
echo.

REM Step 4: Kill old processes
echo 🛑 Step 4: Stopping old servers...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
echo ✅ Old servers stopped
echo.

echo 🎉 Refresh complete!
echo.
echo Next steps:
echo 1. Terminal 1: npm run start:server
echo 2. Terminal 2: npm run start:client
echo 3. Hard refresh browser: Ctrl+Shift+R (3 times)
echo 4. Open: http://localhost:3000
echo.
echo Look for version 1.0.1 in browser console (F12)
echo Admin button should be visible between 'Contact' and 'Inquiry'
echo.
pause
