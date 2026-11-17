"""
Master Runner for DocuMindi-AI
Simply open this file in VS Code and click the "Run" (Play) button!

Both backend and frontend will start, and your browser will open automatically.
"""

import sys
import os
import subprocess
import time
import webbrowser

ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

# Locate virtual environment Python
VENV_PYTHON = os.path.join(BACKEND_DIR, "venv", "Scripts", "python.exe")
if not os.path.exists(VENV_PYTHON):
    VENV_PYTHON = sys.executable


def main():
    os.system("cls" if os.name == "nt" else "clear")

    print("\n" + "=" * 68)
    print("      🚀 STARTING DOCUMINDI-AI (CHAT WITH YOUR PDF)")
    print("=" * 68)
    print(" [1/2] Initializing FastAPI Backend (Uvicorn)...")
    print(" [2/2] Initializing React Frontend (Vite)...")

    # Set cache to D: drive
    env = os.environ.copy()
    env["HF_HOME"] = os.path.join(ROOT_DIR, ".hf_cache")

    processes = []

    try:
        # Start Backend
        backend_proc = subprocess.Popen(
            [VENV_PYTHON, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
            cwd=BACKEND_DIR,
            env=env
        )
        processes.append(backend_proc)

        # Start Frontend
        npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
        frontend_proc = subprocess.Popen(
            [npm_cmd, "run", "dev"],
            cwd=FRONTEND_DIR
        )
        processes.append(frontend_proc)

        # Wait briefly for ports to be ready
        time.sleep(2.5)

        app_url = "http://localhost:5173"

        print("\n" + "=" * 68)
        print("  ✅ APPLICATION IS NOW RUNNING!")
        print("=" * 68)
        print(f"\n  👉 CLICK TO OPEN APP : {app_url}")
        print(f"  👉 API DOCUMENTATION  : http://127.0.0.1:8000/docs\n")
        print("=" * 68)
        print("  Opening browser automatically... Enjoy chatting with your PDF!")
        print("  (Press Ctrl+C in this terminal when you want to stop)\n" + "=" * 68 + "\n")

        # Automatically open in browser
        try:
            webbrowser.open(app_url)
        except Exception:
            pass

        # Keep alive
        while True:
            for p in processes:
                if p.poll() is not None:
                    return
            time.sleep(1)

    except KeyboardInterrupt:
        print("\nStopping DocuMindi-AI servers...")
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
        print("Done. Goodbye!")


if __name__ == "__main__":
    main()
