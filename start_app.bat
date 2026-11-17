@echo off
title DocuMindi-AI
cd /d "%~dp0"

:: Launch using virtualenv python if available, else system python
if exist "backend\venv\Scripts\python.exe" (
    "backend\venv\Scripts\python.exe" run.py
) else (
    python run.py
)

pause
