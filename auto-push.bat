@echo off
echo 🔄 Auto-push script for NIT ITVMS
echo.

REM Check if there are changes
git status --porcelain >nul 2>&1
if %errorlevel% neq 0 (
    echo ✅ No changes to commit
    pause
    exit /b 0
)

echo 📝 Changes detected, committing and pushing...

REM Add all changes
git add .
if %errorlevel% neq 0 (
    echo ❌ Error adding files
    pause
    exit /b 1
)

REM Get current timestamp for commit message
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list') do set datetime=%%I
set commit_msg=Auto-update: %datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%-%datetime:~10,2%-%datetime:~12,2%

REM Commit changes
git commit -m "%commit_msg%"
if %errorlevel% neq 0 (
    echo ❌ Error committing changes
    pause
    exit /b 1
)

REM Push to remote
git push origin main
if %errorlevel% neq 0 (
    echo ❌ Error pushing to GitHub
    pause
    exit /b 1
)

echo.
echo ✅ Successfully pushed changes to GitHub!
echo.
pause
