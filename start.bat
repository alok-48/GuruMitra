@echo off
title GuruMitra - Starting...
color 0E
echo.
echo  ============================================
echo       GuruMitra - Starting Application
echo  ============================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo  [ERROR] Node.js is not installed!
    echo  Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo  [1/5] Installing backend dependencies...
cd /d "%~dp0backend"
call npm install --silent 2>nul
if %errorlevel% neq 0 (
    echo  [!] npm install had warnings, continuing...
)

echo  [2/5] Setting up database...
node src/config/seed.js 2>nul
if %errorlevel% neq 0 (
    echo  [!] Seed skipped (may already exist), continuing...
    node -e "require('./src/config/initDb')()" 2>nul
)

echo  [3/5] Installing frontend dependencies...
cd /d "%~dp0frontend"
call npm install --silent 2>nul

echo  [4/5] Building frontend...
call npm run build 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo  [ERROR] Frontend build failed!
    pause
    exit /b 1
)

echo  [5/5] Starting server...
cd /d "%~dp0backend"
echo.
echo  ============================================
echo    GuruMitra is ready!
echo    Opening http://localhost:5000 ...
echo    (Press Ctrl+C to stop)
echo  ============================================
echo.

:: Open browser after 2 seconds
start /b cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:5000"

:: Start the backend server (this serves frontend too)
node src/server.js
