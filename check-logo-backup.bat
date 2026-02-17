@echo off
echo ============================================
echo Logo File Checker
echo ============================================
echo.

cd /d "%~dp0"

echo Current directory: %CD%
echo.

echo Checking for Gold Logo.png in client\public\...
echo.

if exist "client\public\Gold Logo.png" (
    echo [OK] Found: Gold Logo.png
    dir "client\public\Gold Logo.png"
    echo.
    echo You can now commit this file!
    echo Run: git add "client/public/Gold Logo.png"
) else (
    echo [ERROR] File NOT found: client\public\Gold Logo.png
    echo.
    echo Please copy your logo file to:
    echo %CD%\client\public\Gold Logo.png
    echo.
    echo Current files in client\public\:
    dir "client\public\"
)

echo.
echo ============================================
pause
