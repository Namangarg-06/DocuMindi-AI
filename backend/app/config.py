"""
Configuration Management for DocuMindi-AI RAG Application.
Loads settings from environment variables and .env file.
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

# Base directory of the backend
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

# Ensure Hugging Face cache uses D: drive to prevent C: drive out-of-space issues
if "HF_HOME" not in os.environ:
    os.environ["HF_HOME"] = str(BASE_DIR.parent / ".hf_cache")


class Settings(BaseSettings):
    """Application settings with type hints and defaults."""

    # Groq LLM API Configuration
    GROQ_API_KEY: str = Field(
        default="",
        description="Groq API key for LLM generation. Get free key from https://console.groq.com/keys"
    )
    LLM_MODEL: str = Field(
        default="llama-3.3-70b-versatile",
        description="Groq LLM model identifier (e.g., llama-3.3-70b-versatile, llama-3.1-8b-instant)"
    )
    LLM_TEMPERATURE: float = Field(
        default=0.1,
        description="Sampling temperature for LLM answer generation (lower means more factual)"
    )

    # Local Hugging Face Embedding Configuration
    EMBEDDING_MODEL_NAME: str = Field(
        default="sentence-transformers/all-MiniLM-L6-v2",
        description="Hugging Face embedding model name running locally on CPU"
    )

    # Document Chunking Configuration
    CHUNK_SIZE: int = Field(
        default=1000,
        description="Maximum characters per chunk"
    )
    CHUNK_OVERLAP: int = Field(
        default=200,
        description="Character overlap between consecutive chunks to maintain context"
    )

    # RAG Retrieval Configuration
    TOP_K_CHUNKS: int = Field(
        default=4,
        description="Number of most relevant chunks to retrieve for context"
    )

    # Session Management (Temporary In-Memory Storage)
    SESSION_TIMEOUT_MINUTES: int = Field(
        default=30,
        description="Minutes of inactivity before a session vector store is purged from memory"
    )

    # File Upload & Security Limits
    MAX_UPLOAD_SIZE_MB: int = Field(
        default=25,
        description="Maximum allowed PDF file size in Megabytes"
    )
    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000",
        description="Comma-separated list of allowed CORS origins"
    )

    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH) if ENV_PATH.exists() else None,
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins(self) -> list[str]:
        """Return list of allowed CORS origins."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    def validate_api_key(self) -> None:
        """Validate that GROQ_API_KEY is properly set."""
        if not self.GROQ_API_KEY or self.GROQ_API_KEY.strip() in ("", "your_groq_api_key_here"):
            raise ValueError(
                "GROQ_API_KEY is not configured!\n"
                "Please create a `.env` file inside the `backend/` directory or export GROQ_API_KEY.\n"
                "You can get a free API key at https://console.groq.com/keys"
            )


# Global settings singleton
settings = Settings()
