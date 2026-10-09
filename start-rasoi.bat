@echo off
REM Starts Rasoi: the API (port 5000) and the website (port 5173), each in its own window.
cd /d "%~dp0"

if not exist server\node_modules (
  echo First run: installing the server packages...
  pushd server & call npm install & popd
)
if not exist client\node_modules (
  echo First run: installing the website packages...
  pushd client & call npm install & popd
)
if not exist server\.env (
  echo Creating server\.env with a random login secret...
  node -e "const fs=require('fs');const s=require('crypto').randomBytes(32).toString('hex');fs.writeFileSync('server/.env',fs.readFileSync('server/.env.example','utf8').replace(/^JWT_SECRET=.*$/m,'JWT_SECRET='+s))"
)

start "Rasoi API" /d "%~dp0server" cmd /k npm start
timeout /t 6 /nobreak >nul
start "Rasoi website" /d "%~dp0client" cmd /k npm run dev
timeout /t 4 /nobreak >nul
start "" http://localhost:5173
echo.
echo Rasoi is running. Close the two black windows to stop it.
timeout /t 5 >nul
