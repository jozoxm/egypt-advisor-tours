@echo off
REM Automatic Merge Conflict Resolution Script
REM This accepts all incoming changes from the branch

echo ========================================
echo MERGE CONFLICT AUTO-RESOLVER
echo ========================================
echo.
echo This script will accept all incoming changes
echo from the copilot/remove-video-from-hero branch.
echo.
echo Files to be resolved:
echo - README.md
echo - client/src/App.js
echo - client/public/Gold Logo.png
echo.
pause

echo.
echo Resolving conflicts...
echo.

REM Accept incoming changes for all conflicted files
git checkout --theirs README.md 2>nul
if %errorlevel% equ 0 (
    echo ✓ README.md resolved
) else (
    echo ✗ README.md - no conflict or already resolved
)

git checkout --theirs client/src/App.js 2>nul
if %errorlevel% equ 0 (
    echo ✓ client/src/App.js resolved
) else (
    echo ✗ client/src/App.js - no conflict or already resolved
)

git checkout --theirs "client/public/Gold Logo.png" 2>nul
if %errorlevel% equ 0 (
    echo ✓ client/public/Gold Logo.png resolved
) else (
    echo ✗ client/public/Gold Logo.png - no conflict or already resolved
)

echo.
echo Staging resolved files...
git add README.md 2>nul
git add client/src/App.js 2>nul
git add "client/public/Gold Logo.png" 2>nul

echo.
echo Committing merge...
git commit -m "Resolve merge conflicts - accept incoming changes"

echo.
echo ========================================
echo CONFLICT RESOLUTION COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Run: refresh-admin.bat
echo 2. Start servers:
echo    Terminal 1: npm run start:server
echo    Terminal 2: npm run start:client
echo 3. Hard refresh browser: Ctrl+Shift+R (3 times)
echo 4. Check console for: Version 1.0.1
echo.
echo See START-HERE.md for complete instructions.
echo.
pause
