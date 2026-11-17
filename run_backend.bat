@echo off
title DocuMindi-AI Backend
cd /d "%~dp0backend"

echo ==========================================================
echo Starting FastAPI Backend on http://127.0.0.1:8000
echo ==========================================================
call venv\Scripts\activate.bat
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pause
