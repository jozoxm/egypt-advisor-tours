@echo off
REM Simple Website Preview Script for Egypt Advisor Tours
REM This script helps you quickly start both frontend and backend servers

echo ================================================================================
echo            Egypt Advisor Tours - Website Preview
echo ================================================================================
echo.

REM Check if we're in the right directory
if not exist "server\" (
    echo Error: This script must be run from the egypt-advisor-tours root directory
    pause
    exit /b 1
)

if not exist "client\" (
    echo Error: This script must be run from the egypt-advisor-tours root directory
    pause
    exit /b 1
)

echo [Prerequisites Check...]
echo.

REM Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [OK] Node.js installed: %NODE_VERSION%
)

REM Check npm
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] npm is not installed
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo [OK] npm installed: %NPM_VERSION%
)

echo.
echo [Setting up environment...]
echo.

REM Setup backend
echo [Setting up backend (server)...]
cd server

if not exist "node_modules\" (
    echo Installing backend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo Failed to install backend dependencies
        cd ..
        pause
        exit /b 1
    )
) else (
    echo Backend dependencies already installed
)

if not exist ".env" (
    echo Creating backend .env file...
    (
        echo PORT=5000
        echo MONGODB_URI=mongodb://localhost:27017/egypt-advisor-tours
        echo.
        echo # Email settings ^(optional for preview^)
        echo # EMAIL_SERVICE=gmail
        echo # EMAIL_USER=your-email@gmail.com
        echo # EMAIL_PASSWORD=your-app-password
        echo # COMPANY_EMAIL=info@egyptadvisortours.com
    ) > .env
    echo [OK] Backend .env created
) else (
    echo Backend .env already exists
)

cd ..

REM Setup frontend
echo.
echo [Setting up frontend (client)...]
cd client

if not exist "node_modules\" (
    echo Installing frontend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo Failed to install frontend dependencies
        cd ..
        pause
        exit /b 1
    )
) else (
    echo Frontend dependencies already installed
)

if not exist ".env" (
    echo Creating frontend .env file...
    echo REACT_APP_API_URL=http://localhost:5000/api > .env
    echo [OK] Frontend .env created
) else (
    echo Frontend .env already exists
)

cd ..

echo.
echo ================================================================================
echo                          Starting Servers...
echo ================================================================================
echo.

REM Check MongoDB
echo [Checking MongoDB...]
sc query MongoDB >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] MongoDB service detected
) else (
    echo [!] MongoDB service not detected
    echo You can:
    echo   1. Install MongoDB locally
    echo   2. Use MongoDB Atlas ^(update server\.env with connection string^)
    echo.
    set /p continue="Continue anyway? (y/n): "
    if /i not "%continue%"=="y" exit /b 1
)

echo.
echo [NOTE] Run 'cd server' and 'npm run seed' to add sample tours
echo.
echo [Starting servers...]
echo.

REM Start backend in new window
echo Starting backend server...
start "Egypt Advisor Tours - Backend" cmd /k "cd server && npm start"

REM Wait for backend to initialize
timeout /t 3 /nobreak >nul

REM Start frontend in new window
echo Starting frontend...
start "Egypt Advisor Tours - Frontend" cmd /k "cd client && npm start"

echo.
echo ================================================================================
echo                            SERVERS STARTING
echo ================================================================================
echo.
echo Two new windows have opened:
echo   1. Backend server  - http://localhost:5000
echo   2. Frontend server - http://localhost:3000
echo.
echo The website should open automatically in your browser at:
echo   http://localhost:3000
echo.
echo Tips:
echo   * Close the server windows to stop the servers
echo   * Check HOW_TO_PREVIEW.md for detailed instructions
echo   * Press Ctrl+C in server windows to stop them
echo.
echo ================================================================================
echo.
pause
