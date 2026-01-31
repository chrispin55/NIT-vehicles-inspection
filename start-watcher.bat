@echo off
title NIT ITVMS Auto-Push Watcher
color 0A

echo ========================================
echo   NIT ITVMS Auto-Push Watcher
echo ========================================
echo.
echo 🎯 This will watch for file changes
echo    and automatically push to GitHub
echo.
echo 📁 Watching: frontend/src, backend/src, database
echo ⏱️  Debounce: 3 seconds
echo 🚀 Auto-pushing enabled
echo.
echo ⏹️  Press Ctrl+C to stop watching
echo ========================================
echo.

REM Start the Node.js watcher
node watcher.js

pause
