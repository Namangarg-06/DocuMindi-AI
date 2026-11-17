"""
Session Management Route:
Manages session status and explicit session termination/cleanup.
"""

import logging
from fastapi import APIRouter, status, HTTPException
from app.models.schemas import SessionStatusResponse, DeleteSessionResponse
from app.services.vector_store import vector_store_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/session", tags=["Session Management"])


@router.get(
    "/{session_id}",
    response_model=SessionStatusResponse,
    summary="Get status of an active session"
)
async def get_session_status(session_id: str):
    """Retrieve metadata for an active session."""
    session_data = vector_store_manager.get_session(session_id)
    return SessionStatusResponse(
        session_id=session_id,
        filename=session_data["filename"],
        total_pages=session_data["total_pages"],
        total_chunks=session_data["total_chunks"],
        active=True
    )


@router.delete(
    "/{session_id}",
    response_model=DeleteSessionResponse,
    summary="Delete a session and release its vector store from memory"
)
async def delete_session(session_id: str):
    """
    Explicitly delete an active session.
    Frees the FAISS index and all associated memory structures.
    """
    deleted = vector_store_manager.delete_session(session_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found or already deleted."
        )

    logger.info(f"Explicitly cleared session {session_id}")
    return DeleteSessionResponse(
        session_id=session_id,
        status="deleted",
        message="Session and in-memory vector index successfully purged."
    )
