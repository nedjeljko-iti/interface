@echo off
cd /d "%~dp0backend"
start "ITI Interface" node server.js
timeout /t 2 /nobreak >nul
start "" "http://localhost:3001"
