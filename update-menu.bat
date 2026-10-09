@echo off
REM Updates the sample dishes in the database (for example after adding photos), then restarts the API.
cd /d "%~dp0"
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":5000" ^| findstr LISTENING') do taskkill /PID %%p /F >nul 2>&1
taskkill /IM mongod.exe /F >nul 2>&1
timeout /t 3 /nobreak >nul
cd server
call npm run seed > "%~dp0seed-log.txt" 2>&1
cd ..
start "Rasoi API" /d "%~dp0server" cmd /k "npm start > ..\server-log.txt 2>&1"
