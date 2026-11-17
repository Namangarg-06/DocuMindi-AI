"""
Master One-Click Runner for DocuMindi-AI
Starts both FastAPI Backend and React Frontend concurrently,
prints clickable links, and automatically opens your browser.

Usage:
    python run.py
    (or double-click start_app.bat)
"""

import sys
import os
import subprocess
import time
import webbrowser
import signal

ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

# Locate virtual environment Python
VENV_PYTHON = os.path.join(BACKEND_DIR, "venv", "Scripts", "python.exe")
if not os.path.exists(VENV_PYTHON):
    VENV_PYTHON = sys.executable  # Fallback to system python


def check_api_key():
    """Check if Groq API key is present in .env file."""
    env_file = os.path.join(BACKEND_DIR, ".env")
    if not os.path.exists(env_file):
        return False
    try:
        with open(env_file, "r", encoding="utf-8") as f:
            content = f.read()
            if "GROQ_API_KEY=" in content:
                for line in content.splitlines():
                    if line.startswith("GROQ_API_KEY="):
                        val = line.split("=", 1)[1].strip()
                        return bool(val and val not in ("your_groq_api_key_here", ""))
    except Exception:
        pass
    return False


def main():
    print("\n" + "=" * 65)
    print("      🚀 Starting DocuMindi-AI (Chat With Your PDF)")
    print("=" * 65)

    has_key = check_api_key()
    if not has_key:
        print("\n⚠️  NOTE: Groq API Key is not configured yet in 'backend/.env'.")
        print("   Upload and chunking will work, but to ask questions, add your")
        print("   free Groq API key in 'backend/.env' (https://console.groq.com/keys).\n")

    # Ensure D: drive cache environment variables
    env = os.environ.copy()
    env["HF_HOME"] = os.path.join(ROOT_DIR, ".hf_cache")

    processes = []

    try:
        # 1. Start FastAPI Backend
        print("-> [1/2] Launching FastAPI Backend on http://127.0.0.1:8000 ...")
        backend_proc = subprocess.Popen(
            [VENV_PYTHON, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
            cwd=BACKEND_DIR,
            env=env
        )
        processes.append(backend_proc)

        # 2. Start React Frontend
        print("-> [2/2] Launching React Frontend on http://localhost:5173 ...")
        npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
        frontend_proc = subprocess.Popen(
            [npm_cmd, "run", "dev"],
            cwd=FRONTEND_DIR
        )
        processes.append(frontend_proc)

        # Wait for servers to spin up
        time.sleep(2.5)

        # Automatically open browser
        app_url = "http://localhost:5173"
        print("\n" + "=" * 65)
        print("  🎉 All systems running!")
        print("=" * 65)
        print(f"  👉 Web Application : {app_url}  (Opening in browser...)")
        print(f"  👉 API Swagger Docs : http://127.0.0.1:8000/docs")
        print("=" * 65)
        print("  [Press Ctrl+C anytime to stop both servers]\n")

        try:
            webbrowser.open(app_url)
        except Exception:
            pass

        # Keep master process alive and monitor child processes
        while True:
            for p in processes:
                if p.poll() is not None:
                    print(f"\n[Notice] Process {p.pid} exited with code {p.returncode}")
                    return
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n\nShutting down DocuMindi-AI servers...")
    finally:
        for p in processes:
            try:
                p.terminate()
                p.wait(timeout=2)
            except Exception:
                try:
                    p.kill()
                except Exception:
                    pass
        print("All servers stopped successfully. Bye!")


if __name__ == "__main__":
    main()
