@echo off
REM Restarts only the API server (after a server code change).
cd /d "%~dp0"
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":5000" ^| findstr LISTENING') do taskkill /PID %%p /F >nul 2>&1
REM Also stop the local database the old server started, so the new one can open the data folder
taskkill /IM mongod.exe /F >nul 2>&1
timeout /t 3 /nobreak >nul
start "Rasoi API" /d "%~dp0server" cmd /k "npm start > ..\server-log.txt 2>&1"
