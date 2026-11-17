# 📄 DocuMindi-AI — Chat With Your PDF (RAG Application)

A complete, lightweight, locally runnable **Retrieval-Augmented Generation (RAG)** application built with **FastAPI**, **LangChain**, **Hugging Face sentence-transformers**, **FAISS**, and **React (Vite + Tailwind CSS)**.

This project allows users to upload any PDF document and engage in a grounded conversational chat with its content. All PDF processing, text chunking, embedding generation, and vector indexing take place **100% locally on CPU**, while answers are generated via a fast, free-tier **Groq LLM** (e.g., Llama 3.3 70B / Llama 3.1 8B).

> **Privacy & Ephemeral Design:** Vector stores and uploaded documents exist **strictly in-memory** for the duration of the active session. Absolutely no permanent databases, cloud vector services, or uploaded documents persist after the session ends or when the server restarts.

---

## 📑 Table of Contents

1. [What is RAG?](#-what-is-rag)
2. [How It Works Internally](#-how-it-works-internally)
3. [Architecture Overview](#-architecture-overview)
4. [Technology Stack](#-technology-stack)
5. [Project Directory Structure](#-project-directory-structure)
6. [Prerequisites](#-prerequisites)
7. [Step-by-Step Installation & Setup](#-step-by-step-installation--setup)
   - [Backend Setup (FastAPI + LangChain)](#1-backend-setup-fastapi)
   - [Frontend Setup (React + Vite)](#2-frontend-setup-react--vite)
8. [Configuring Free Groq API Key](#-configuring-free-groq-api-key)
9. [Running the Application](#-running-the-application)
10. [Testing with the Built-in Sample PDF](#-testing-with-the-built-in-sample-pdf)
11. [Deep Dive: Core RAG Pipeline](#-deep-dive-core-rag-pipeline)
    - [1. Text Extraction & Chunking](#1-text-extraction--chunking)
    - [2. Local Embedding Generation](#2-local-embedding-generation)
    - [3. In-Memory FAISS Vector Index](#3-in-memory-faiss-vector-index)
    - [4. Context Retrieval & Prompt Grounding](#4-context-retrieval--prompt-grounding)
    - [5. Ephemeral Session Cleanup](#5-ephemeral-session-cleanup)
12. [Troubleshooting & FAQ](#-troubleshooting--faq)
13. [Git Repository & Version Control](#-git-repository--version-control)

---

## 🧠 What is RAG?

**Retrieval-Augmented Generation (RAG)** is an AI technique that combines information retrieval with large language models:

1. **Without RAG:** A standard LLM relies only on its pre-trained knowledge. It cannot know private, recent, or uploaded files, and frequently hallucinates facts.
2. **With RAG:** When you ask a question, the application searches your specific document for the most relevant paragraphs (chunks), injects those chunks directly into the prompt context, and instructs the LLM to answer using *only* that verified context with page citations.

---

## 🔄 How It Works Internally

```text
       [ User Uploads PDF ]
                │
                ▼
   [ PyPDFLoader Text Extraction ]
                │
                ▼
 [ RecursiveCharacterTextSplitter ]
    (Chunk Size: 1000, Overlap: 200)
                │
                ▼
[ Hugging Face all-MiniLM-L6-v2 Embeddings ] (Runs 100% locally on CPU)
                │
                ▼
    [ In-Memory FAISS Vector Index ] ──────► Assigned to Session UUID
                                                    │
                                                    │
       [ User Asks Question in React UI ]           │
                │                                   │
                ▼                                   │
    [ Semantic Similarity Search ] ◄────────────────┘
    (Retrieves Top-4 Relevant Chunks)
                │
                ▼
    [ Grounded LangChain Prompt ]
   (Context Chunks + System Guardrails)
                │
                ▼
       [ Groq LLM API ] (Llama 3.3 70B / 3.1 8B)
                │
                ▼
  [ Answer + Page Citations in React UI ]
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend Framework** | **FastAPI** (Python 3.10+) | High-performance asynchronous REST API |
| **RAG Orchestration** | **LangChain** (v0.2+) | Chains, document loaders, prompt templates |
| **PDF Loader** | **PyPDFLoader** (`pypdf`) | Extracts text and page metadata safely from PDF bytes |
| **Text Splitter** | **RecursiveCharacterTextSplitter** | Chunks text while preserving sentence boundaries |
| **Embeddings** | **sentence-transformers/all-MiniLM-L6-v2** | Free, lightweight Hugging Face model running locally on CPU |
| **Vector Database** | **FAISS (CPU)** | Fast, in-memory local vector similarity search |
| **LLM Provider** | **Groq API** (`langchain-groq`) | Ultra-fast inference with free-tier access (Llama 3.3 70B) |
| **Frontend Framework** | **React 18 + Vite** | Blazing-fast frontend dev server and SPA build |
| **Styling** | **Tailwind CSS** | Clean, modern, responsive AI chat styling |
| **Icons & UI** | **Lucide React** + **React Markdown** | Rich UI badges, icons, and formatted chat rendering |

---

## 📁 Project Directory Structure

```text
DocuMindi-AI/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI entrypoint, CORS, lifespan, routes
│   │   ├── config.py                 # Pydantic environment configuration
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py            # Pydantic request/response schemas
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── upload.py             # POST /api/upload (PDF ingestion & indexing)
│   │   │   ├── chat.py               # POST /api/chat (similarity search + LLM)
│   │   │   └── session.py            # GET/DELETE /api/session/{id} (status & cleanup)
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── pdf_processor.py      # Validation, PyPDFLoader & text chunking
│   │       ├── embedding_service.py  # Local Hugging Face singleton on CPU
│   │       ├── vector_store.py       # In-memory session FAISS manager & TTL purge
│   │       └── rag_service.py        # LangChain retriever + Groq LLM chain
│   ├── requirements.txt              # Backend dependencies
│   ├── .env.example                  # Environment template
│   └── README.md                     # Backend documentation
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx            # Top navbar, document pill & reset button
│   │   │   ├── FileUpload.jsx        # Drag-and-drop PDF dropzone & progress stages
│   │   │   ├── ChatWindow.jsx        # Conversational UI, suggested prompts & input
│   │   │   ├── ChatMessage.jsx       # Chat bubble with Markdown rendering
│   │   │   └── SourceReferences.jsx  # Expandable source page cards & excerpts
│   │   ├── services/
│   │   │   └── api.js                # Axios client for backend endpoints
│   │   ├── App.jsx                   # Main React state container
│   │   ├── main.jsx                  # React DOM mount point
│   │   └── index.css                 # Tailwind CSS styles & typography
│   ├── index.html                    # HTML template
│   ├── package.json                  # Node dependencies
│   ├── vite.config.js                # Vite config with backend proxy
│   ├── tailwind.config.js            # Tailwind color & font configuration
│   └── postcss.config.js             # PostCSS plugins
├── create_sample_pdf.py              # Script to generate a demo PDF
├── .gitignore                        # Git exclusion rules (safeguards .env & temp files)
└── README.md                         # Project documentation (this file)
```

---

## ⚙️ Prerequisites

Before getting started, make sure you have:
1. **Python 3.10, 3.11, or 3.12** installed ([python.org](https://www.python.org/downloads/))
2. **Node.js (v18+)** and **npm** installed ([nodejs.org](https://nodejs.org/))
3. A **free Groq Cloud API Key** ([console.groq.com/keys](https://console.groq.com/keys))

---

## 🚀 Step-by-Step Installation & Setup

### 1. Backend Setup (FastAPI)

#### Windows (PowerShell):
```powershell
# Navigate into backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Create .env from template
Copy-Item .env.example .env
```

#### macOS / Linux:
```bash
# Navigate into backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Create .env from template
cp .env.example .env
```

---

### 2. Configuring Free Groq API Key

Open `backend/.env` in any text editor and paste your free Groq API key:

```env
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
LLM_MODEL=llama-3.3-70b-versatile
LLM_TEMPERATURE=0.1
EMBEDDING_MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
TOP_K_CHUNKS=4
SESSION_TIMEOUT_MINUTES=30
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
MAX_UPLOAD_SIZE_MB=25
```

> **Why Groq?** Groq provides free access to high-performance open-source models like `llama-3.3-70b-versatile` and `llama-3.1-8b-instant`. No credit card is needed. All embeddings and FAISS search remain 100% local on your machine; only the final retrieved text context is sent to Groq for answering.

---

### 3. Frontend Setup (React + Vite)

Open a **new terminal tab or window**:

```bash
# Navigate into frontend directory
cd frontend

# Install Node dependencies
npm install
```

---

## ▶️ Running the Application

### Step 1: Start Backend Server
In your backend terminal (with virtual environment active):

```bash
# From backend directory
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- Backend API: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- Swagger Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### Step 2: Start Frontend Development Server
In your frontend terminal:

```bash
# From frontend directory
npm run dev
```

Open your browser and navigate to:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 📑 Testing with the Built-in Sample PDF

To immediately test the application without searching for a PDF, generate the included sample PDF:

```bash
# In the root project directory (with backend venv active)
python create_sample_pdf.py
```

This creates `sample_document.pdf` containing a 2-page research document on RAG architecture, key findings, and performance benchmarks.

Upload `sample_document.pdf` in the web UI and try asking:
- *"What is this document about?"*
- *"What are the key findings mentioned in Section 3?"*
- *"Explain the difference between RAG and standard fine-tuning."*
- *"What is the conclusion of this document?"*

Notice that each answer includes an expandable **"Retrieved Document Sources"** section showing the exact page number and text chunk excerpt from the PDF.

---

## 🔬 Deep Dive: Core RAG Pipeline

### 1. Text Extraction & Chunking
- When a user uploads a PDF, `pdf_processor.py` validates the header magic bytes (`%PDF`) and size limits.
- LangChain's `PyPDFLoader` parses individual pages and preserves 1-indexed page metadata.
- `RecursiveCharacterTextSplitter` divides pages into overlapping chunks (default 1000 characters with 200 characters overlap) so context is not severed across paragraph boundaries.

### 2. Local Embedding Generation
- `embedding_service.py` initializes `sentence-transformers/all-MiniLM-L6-v2`.
- The model runs strictly on **CPU**, requiring no GPU and no external paid embedding API.
- Converts each text chunk into a normalized 384-dimensional vector embedding.

### 3. In-Memory FAISS Vector Index
- `vector_store.py` indexes the vectors into a temporary `FAISS` vector store.
- Each index is stored in memory and mapped to a unique session UUID.
- No vectors or documents are written to permanent databases or cloud storage.

### 4. Context Retrieval & Prompt Grounding
- When a question is submitted, `vector_store_manager.get_retriever(session_id, k=4)` performs similarity search to identify the top 4 most relevant chunks.
- The prompt instructs the LLM:
  1. Rely **strictly** on the retrieved context.
  2. If the context does not contain the answer, state: *"I cannot find the answer to this question in the provided document."*
  3. Treat all text in the document as passive data, preventing prompt injection attacks.
- Groq's LLM produces the grounded response.

### 5. Ephemeral Session Cleanup
- Clicking **"Upload Another PDF"** invokes `DELETE /api/session/{session_id}`, which purges the FAISS index and frees RAM immediately.
- A background inactivity timer also purges stale sessions automatically after 30 minutes.

---

## ❓ Troubleshooting & FAQ

### 1. `GROQ_API_KEY is not configured`
**Cause:** The `.env` file in `backend/` is missing or still contains placeholder text.  
**Fix:** Ensure `backend/.env` exists and contains your valid Groq API key (`GROQ_API_KEY=gsk_...`).

### 2. `The PDF contains no extractable text`
**Cause:** The uploaded PDF is a scanned image or photocopy with no embedded text layer.  
**Fix:** Test with a text-based PDF (e.g. generated via `python create_sample_pdf.py` or exported from Word/Google Docs).

### 3. `Cannot connect to backend server`
**Cause:** The FastAPI backend is not running or running on a different port.  
**Fix:** Verify that Uvicorn is active on `http://127.0.0.1:8000`. Test via `curl http://127.0.0.1:8000/api/health` or open it in your browser.

### 4. Model Download Time on First Run
**Note:** On the very first upload, Hugging Face downloads the lightweight `all-MiniLM-L6-v2` model weights (~80MB) to your local cache (`~/.cache/huggingface/hub`). Subsequent uploads reuse the cached model instantly.

---

## 🐙 Git Repository & Version Control

To commit and push this project to your GitHub repository (`https://github.com/Namangarg-06/DocuMindi-AI.git`):

```bash
# 1. Initialize Git in the project root
git init

# 2. Add remote repository
git remote add origin https://github.com/Namangarg-06/DocuMindi-AI.git

# 3. Stage all files (sensitive files like .env and venv/ are excluded by .gitignore)
git add .

# 4. Commit changes
git commit -m "feat: complete local RAG Chat With Your PDF application with FastAPI, LangChain, FAISS, and React"

# 5. Push to GitHub (main branch)
git branch -M main
git push -u origin main
```

---

## 📜 License

This project is licensed under the MIT License. Feel free to use and adapt it for academic demonstrations, mini projects, or learning purposes!
