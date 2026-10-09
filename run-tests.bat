@echo off
REM Installs everything, runs the API tests and builds the website. Results go to test-log.txt too.
cd /d "%~dp0"
set LOG=%~dp0test-log.txt
echo Rasoi check %date% %time% > "%LOG%"

echo [1/4] Installing server packages...
pushd server
call npm install --no-audit --no-fund >> "%LOG%" 2>&1
echo [2/4] Running API tests (the first time downloads a small MongoDB, please wait)...
call npm test >> "%LOG%" 2>&1
if errorlevel 1 (echo TESTS FAILED >> "%LOG%") else (echo TESTS PASSED >> "%LOG%")
popd

echo [3/4] Installing website packages...
pushd client
call npm install --no-audit --no-fund >> "%LOG%" 2>&1
echo [4/4] Building the website...
call npm run build >> "%LOG%" 2>&1
if errorlevel 1 (echo BUILD FAILED >> "%LOG%") else (echo BUILD OK >> "%LOG%")
popd

echo ALL DONE >> "%LOG%"
type "%LOG%" | findstr /c:"TESTS" /c:"BUILD" /c:"# pass" /c:"# fail"
echo.
echo Full details are in test-log.txt
pause
