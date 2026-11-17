# DocuMindi-AI Backend (FastAPI + LangChain RAG)

This directory contains the FastAPI backend for **DocuMindi-AI / Chat With Your PDF**. It handles PDF parsing, text chunking, local Hugging Face embeddings, in-memory FAISS vector indexing, and grounded question answering via Groq's LLM.

---

## 🏗️ Architecture & Modules

- `app/config.py`: Environment configuration via Pydantic settings.
- `app/models/schemas.py`: Request and response data contracts.
- `app/services/pdf_processor.py`: Safe PDF parsing, validation, and chunking with `PyPDFLoader` and `RecursiveCharacterTextSplitter`.
- `app/services/embedding_service.py`: Local Hugging Face sentence-transformers embedding singleton (`all-MiniLM-L6-v2`) running on CPU.
- `app/services/vector_store.py`: In-memory session-isolated FAISS vector store manager with automatic inactivity purge.
- `app/services/rag_service.py`: LangChain retrieval chain + Groq LLM grounded answering and citation formatting.
- `app/routes/`:
  - `upload.py`: `POST /api/upload` - Processes PDF, creates session FAISS index.
  - `chat.py`: `POST /api/chat` - Queries vector index and generates LLM answer.
  - `session.py`: `GET/DELETE /api/session/{session_id}` - Session status & memory purge.

---

## 🚀 Setup & Execution

### 1. Create a Python Virtual Environment

```bash
# Windows (PowerShell)
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1

# Linux / macOS
cd backend
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux / macOS
cp .env.example .env
```

Open `.env` and configure your **free Groq API Key**:
```env
GROQ_API_KEY=gsk_your_actual_key_here
LLM_MODEL=llama-3.3-70b-versatile
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
SESSION_TIMEOUT_MINUTES=30
```
> Obtain a free Groq API key at: [https://console.groq.com/keys](https://console.groq.com/keys)

### 4. Run the Backend Server

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at:
- Interactive Swagger API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
