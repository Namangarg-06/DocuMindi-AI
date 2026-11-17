"""
Embedding Service:
Loads and manages the Hugging Face sentence-transformers embedding model
locally on CPU. Completely free, no paid APIs, no hosted cloud service.
"""

import logging
from typing import Optional
from app.config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Manages the local Hugging Face embedding model singleton."""

    _instance: Optional["EmbeddingService"] = None
    _embeddings = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
        return cls._instance

    def get_embeddings(self):
        """
        Lazy-load and return the HuggingFaceEmbeddings instance.
        Uses sentence-transformers/all-MiniLM-L6-v2 running on CPU.
        """
        if self._embeddings is None:
            logger.info(f"Loading local embedding model: {settings.EMBEDDING_MODEL_NAME} on CPU...")

            # Attempt modern langchain_huggingface first, then fallback to langchain_community
            try:
                from langchain_huggingface import HuggingFaceEmbeddings
                logger.info("Using langchain_huggingface.HuggingFaceEmbeddings")
            except ImportError:
                from langchain_community.embeddings import HuggingFaceEmbeddings
                logger.info("Using langchain_community.embeddings.HuggingFaceEmbeddings")

            self._embeddings = HuggingFaceEmbeddings(
                model_name=settings.EMBEDDING_MODEL_NAME,
                model_kwargs={"device": "cpu"},
                encode_kwargs={"normalize_embeddings": True}
            )
            logger.info("Local embedding model loaded successfully.")

        return self._embeddings


# Singleton instance
embedding_service = EmbeddingService()
