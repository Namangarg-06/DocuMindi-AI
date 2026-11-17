@echo off
title DocuMindi-AI Launcher
cd /d "%~dp0"

echo ==========================================================
echo       DocuMindi-AI: Chat With Your PDF (RAG Application)
echo ==========================================================
echo.
echo Starting FastAPI Backend and React Frontend...
echo.

:: 1. Start Backend in a new window
start "DocuMindi Backend (FastAPI)" cmd /k "cd /d ""%~dp0backend"" && call venv\Scripts\activate.bat && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

:: Wait 2 seconds for backend to initialize
timeout /t 2 /nobreak >nul

:: 2. Start Frontend in a new window
start "DocuMindi Frontend (React + Vite)" cmd /k "cd /d ""%~dp0frontend"" && call npm.cmd run dev"

echo.
echo ==========================================================
echo Backend & Frontend launched in separate windows!
echo.
echo - Frontend URL: http://localhost:5173
echo - Backend API:  http://127.0.0.1:8000
echo - Swagger Docs: http://127.0.0.1:8000/docs
echo ==========================================================
echo.
pause
