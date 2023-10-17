@echo off
title Streamable

REM Change working directory to your project folder
cd /d "C:\Users\Erkz\Documents\GitHub\streamable"

REM Open Port 3000
netsh advfirewall firewall add rule name="Open Port 3000" dir=in action=allow protocol=TCP localport=3000

REM Perform Git and NPM commands
echo ==========================
echo Updating the Git repository...
echo ==========================
git fetch
echo ==========================
echo Pulling from Git...
echo ==========================
git pull
echo ==========================
echo Installing npm packages...
echo ==========================
call npm install
echo ==========================
echo Starting the application...
echo ==========================
call npm start
echo ==========================
echo Starting the application...
echo ==========================

REM Pause to keep the command prompt window open
pause


