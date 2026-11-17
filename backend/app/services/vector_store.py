"""
Vector Store Management Service:
Manages temporary, in-memory FAISS vector databases isolated per session.
Ensures zero permanent document storage or vector persistence across restarts.
"""

import uuid
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from fastapi import HTTPException, status
from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS

from app.config import settings
from app.services.embedding_service import embedding_service

logger = logging.getLogger(__name__)


class SessionVectorStoreManager:
    """
    In-memory session manager for temporary FAISS vector indexes.
    All data is wiped when a session is closed or the server restarts.
    """

    def __init__(self):
        # session_id -> {
        #   "vector_store": FAISS,
        #   "filename": str,
        #   "total_pages": int,
        #   "total_chunks": int,
        #   "created_at": datetime,
        #   "last_active": datetime
        # }
        self._sessions: Dict[str, Dict[str, Any]] = {}

    def cleanup_expired_sessions(self) -> int:
        """Purge sessions that have exceeded the inactivity timeout."""
        now = datetime.now()
        timeout = timedelta(minutes=settings.SESSION_TIMEOUT_MINUTES)
        expired_ids = [
            sid for sid, data in self._sessions.items()
            if (now - data["last_active"]) > timeout
        ]

        for sid in expired_ids:
            logger.info(f"Purging expired session: {sid} (inactive > {settings.SESSION_TIMEOUT_MINUTES}m)")
            self.delete_session(sid)

        return len(expired_ids)

    def create_session(
        self,
        chunks: List[Document],
        filename: str,
        total_pages: int
    ) -> str:
        """
        Create a new in-memory FAISS index for the document chunks and
        bind it to a unique session UUID.
        """
        # Proactively clean up any stale sessions
        self.cleanup_expired_sessions()

        session_id = str(uuid.uuid4())
        embeddings = embedding_service.get_embeddings()

        logger.info(f"Generating FAISS index for {len(chunks)} chunks in session {session_id}...")
        vector_store = FAISS.from_documents(documents=chunks, embedding=embeddings)

        now = datetime.now()
        self._sessions[session_id] = {
            "vector_store": vector_store,
            "filename": filename,
            "total_pages": total_pages,
            "total_chunks": len(chunks),
            "created_at": now,
            "last_active": now
        }

        logger.info(f"Session {session_id} created successfully with {len(chunks)} chunks.")
        return session_id

    def get_session(self, session_id: str) -> Dict[str, Any]:
        """
        Retrieve session metadata and refresh its last_active timestamp.
        Raises 404 if session is not found or has expired.
        """
        self.cleanup_expired_sessions()

        if session_id not in self._sessions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found or has expired. Please upload your PDF again."
            )

        # Update activity timestamp
        self._sessions[session_id]["last_active"] = datetime.now()
        return self._sessions[session_id]

    def get_retriever(self, session_id: str, k: int = settings.TOP_K_CHUNKS):
        """Return a LangChain retriever for the session's vector store."""
        session_data = self.get_session(session_id)
        vector_store: FAISS = session_data["vector_store"]
        return vector_store.as_retriever(search_kwargs={"k": k})

    def delete_session(self, session_id: str) -> bool:
        """Safely destroy the vector store and session data from memory."""
        if session_id in self._sessions:
            # Explicitly clear references for garbage collection
            session_data = self._sessions.pop(session_id)
            if "vector_store" in session_data:
                del session_data["vector_store"]
            del session_data
            logger.info(f"Session {session_id} successfully deleted from memory.")
            return True
        return False

    def list_active_session_ids(self) -> List[str]:
        """Return a list of currently active session IDs."""
        return list(self._sessions.keys())


# Singleton instance
vector_store_manager = SessionVectorStoreManager()
