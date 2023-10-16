@echo off
TITLE Streamable
netsh advfirewall firewall add rule name="Open Port 3000" dir=in action=allow protocol=TCP localport=3000
ECHO ==========================
ECHO git fetch
ECHO ==========================
ECHO git pull
ECHO ==========================
ECHO npm install
ECHO ==========================
ECHO npm start