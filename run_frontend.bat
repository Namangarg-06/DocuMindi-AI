@echo off
title DocuMindi-AI Frontend
cd /d "%~dp0frontend"

echo ==========================================================
echo Starting React Frontend on http://localhost:5173
echo ==========================================================
call npm.cmd run dev
pause
