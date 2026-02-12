@echo off
REM Egypt Advisor Tours - Automated Setup Script (Windows)
REM This script will install dependencies and start the development server

echo ==========================================
echo Egypt Advisor Tours - Setup ^& Start
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Error: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo √ Node.js detected
node --version
echo √ npm detected
npm --version
echo.

REM Navigate to client directory
cd client
if %ERRORLEVEL% NEQ 0 (
    echo X Error: client directory not found!
    pause
    exit /b 1
)

REM Check if node_modules exists
if exist "node_modules\" (
    echo √ Dependencies already installed
    echo.
) else (
    echo Installing dependencies...
    echo This may take 2-3 minutes...
    echo.
    call npm install
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo √ Dependencies installed successfully!
        echo.
    ) else (
        echo.
        echo X Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Start the development server
echo Starting development server...
echo Your browser will open to http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo ==========================================
echo.

npm start
