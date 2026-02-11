@echo off
REM Quick Fix Script for Git Merge Conflict with package-lock.json
REM This script resolves the common issue when pulling updates

echo =========================================
echo Git Merge Conflict Quick Fix
echo =========================================
echo.

REM Check if we're in the right directory
if not exist "server\" (
    echo Error: This script must be run from the egypt-advisor-tours root directory
    exit /b 1
)

REM Check if package-lock.json exists
if exist "server\package-lock.json" (
    echo Found server\package-lock.json
    
    REM Check if it's tracked by git
    git ls-files --error-unmatch server/package-lock.json >nul 2>&1
    if %errorlevel% equ 0 (
        echo File is already tracked by git
    ) else (
        echo File is untracked - this is causing the merge conflict
        echo.
        set /p confirm="Do you want to remove it and pull updates? (y/n): "
        if /i "%confirm%"=="y" (
            echo Removing untracked package-lock.json...
            del server\package-lock.json
            echo Removed successfully
        ) else (
            echo Aborted. You can manually remove the file and try again.
            exit /b 1
        )
    )
) else (
    echo No conflicting package-lock.json found
)

echo.
echo Pulling updates from copilot/finish-project-tasks...
git pull origin copilot/finish-project-tasks
if %errorlevel% neq 0 (
    echo Failed to pull updates. Please check the error message above.
    exit /b 1
)

echo Successfully pulled updates!
echo.
echo Installing dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo Failed to install dependencies.
    exit /b 1
)

echo.
echo Checking for vulnerabilities...
call npm audit

echo.
echo =========================================
echo All done! Your repository is up to date.
echo =========================================
pause
