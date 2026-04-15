@echo off
REM Resolve CSS Merge Conflict - Windows Script
REM This script resolves the App.css merge conflict by accepting incoming changes

echo.
echo ========================================
echo   Resolving CSS Merge Conflict
echo ========================================
echo.

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo ERROR: Not in a git repository!
    echo Please run this from the egypt-advisor-tours directory.
    pause
    exit /b 1
)

echo Step 1: Accepting incoming changes for App.css...
git checkout --theirs client/src/App.css
if errorlevel 1 (
    echo ERROR: Failed to checkout incoming version!
    echo Make sure you have a merge conflict in client/src/App.css
    pause
    exit /b 1
)
echo ✓ Incoming CSS accepted

echo.
echo Step 2: Staging resolved file...
git add client/src/App.css
if errorlevel 1 (
    echo ERROR: Failed to stage file!
    pause
    exit /b 1
)
echo ✓ File staged

echo.
echo Step 3: Committing merge...
git commit -m "Resolve CSS merge conflict - accept incoming UI improvements"
if errorlevel 1 (
    echo ERROR: Failed to commit!
    pause
    exit /b 1
)
echo ✓ Merge committed

echo.
echo ========================================
echo   ✓ CSS Conflict Resolved!
echo ========================================
echo.
echo Next steps:
echo   1. cd client
echo   2. npm install
echo   3. cd ..
echo   4. npm run start:server (in Terminal 1)
echo   5. npm run start:client (in Terminal 2)
echo   6. Hard refresh browser 3x (Ctrl+Shift+R)
echo.
echo See RESOLVE-CSS-CONFLICT.md for details
echo.
pause
