@echo off
echo ====================================
echo  Interview Intelligence - Start All
echo ====================================

echo.
echo [1/3] Starting Speech Emotion API (port 8000)...
start "Emotion API" cmd /k "cd /d %~dp0 && python emotion_service/api.py"

echo Waiting for Emotion API to start...
timeout /t 5 /nobreak >nul

echo.
echo [2/3] Starting Body Language API (port 8001)...
start "Body Language API" cmd /k "cd /d %~dp0 && python emotion_service/body_language_api.py"

echo Waiting for Body Language API to start...
timeout /t 8 /nobreak >nul

echo.
echo [3/3] Starting Next.js Dev Server (port 3000)...
start "Next.js" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ====================================
echo  All services starting!
echo  - App:               http://localhost:3000
echo  - Speech Emotion API: http://localhost:8000
echo  - Body Language API:  http://localhost:8001
echo ====================================
echo.
pause
