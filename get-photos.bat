@echo off
REM Downloads the dish photos from Wikimedia Commons (needs internet, only once).
cd /d "%~dp0server"
node scripts\fetch-dish-photos.mjs > "%~dp0photos-log.txt" 2>&1
echo DONE >> "%~dp0photos-log.txt"
