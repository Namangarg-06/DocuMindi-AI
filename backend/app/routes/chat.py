"""
Chat Route:
Accepts user questions for an active PDF session, retrieves context
via FAISS, and generates answers using the LangChain RAG pipeline.
"""

import logging
from fastapi import APIRouter, status
from app.models.schemas import ChatRequest, ChatResponse
from app.services.rag_service import rag_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Document Chat"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Ask a question about the uploaded PDF"
)
async def chat_with_pdf(request: ChatRequest):
    """
    Chat with the uploaded document:
    - Validates active session ID.
    - Conducts similarity search against session's FAISS index.
    - Prompts Groq LLM with retrieved context chunks.
    - Returns grounded answer with source page citations.
    """
    result = await rag_service.answer_question(
        session_id=request.session_id,
        question=request.question
    )

    return ChatResponse(
        answer=result["answer"],
        sources=result["sources"]
    )
