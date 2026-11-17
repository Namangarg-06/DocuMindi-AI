"""
Main FastAPI Application Entrypoint:
Wires up routers, CORS middleware, global exception handlers,
and server lifecycle hooks.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.models.schemas import HealthResponse
from app.routes.upload import router as upload_router
from app.routes.chat import router as chat_router
from app.routes.session import router as session_router
from app.services.embedding_service import embedding_service
from app.services.vector_store import vector_store_manager

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("documindi-backend")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events: preload embedding model and perform cleanups."""
    logger.info("Initializing DocuMindi-AI RAG Application...")
    logger.info(f"LLM Model configured: {settings.LLM_MODEL}")
    logger.info(f"Local Embedding Model configured: {settings.EMBEDDING_MODEL_NAME}")

    # Check if GROQ_API_KEY is configured
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY.strip() in ("", "your_groq_api_key_here"):
        logger.warning(
            "*** WARNING: GROQ_API_KEY is not set! ***\n"
            "Set GROQ_API_KEY in backend/.env to enable chat generation.\n"
            "Get a free API key at https://console.groq.com/keys"
        )
    else:
        logger.info("GROQ_API_KEY is detected.")

    yield

    # Shutdown cleanup
    active_count = len(vector_store_manager.list_active_session_ids())
    logger.info(f"Shutting down. Purging {active_count} remaining in-memory session(s)...")
    for sid in vector_store_manager.list_active_session_ids():
        vector_store_manager.delete_session(sid)
    logger.info("Shutdown complete.")


app = FastAPI(
    title="Chat With Your PDF (DocuMindi-AI) API",
    description="A lightweight, local session-based RAG application using LangChain, Hugging Face, FAISS, and Groq.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins if settings.cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(upload_router)
app.include_router(chat_router)
app.include_router(session_router)


@app.get("/api/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """System health check endpoint."""
    return HealthResponse(
        status="healthy",
        service="Chat With Your PDF (DocuMindi-AI)",
        embedding_model=settings.EMBEDDING_MODEL_NAME,
        llm_model=settings.LLM_MODEL
    )


@app.get("/", tags=["System"])
async def root():
    """Root info endpoint."""
    return {
        "message": "Chat With Your PDF API is running.",
        "docs": "/docs",
        "health": "/api/health"
    }


# Global Exception Handler
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"An unexpected error occurred: {str(exc)}"}
    )
