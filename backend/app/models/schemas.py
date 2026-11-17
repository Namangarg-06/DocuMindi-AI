"""
Pydantic models and schemas for request validation and API responses.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class UploadResponse(BaseModel):
    """Response returned upon successful PDF upload and processing."""
    session_id: str = Field(..., description="Unique UUID for this session's vector store")
    filename: str = Field(..., description="Original filename of the uploaded PDF")
    total_pages: int = Field(..., description="Total pages extracted from the PDF")
    total_chunks: int = Field(..., description="Total text chunks generated and indexed in FAISS")
    status: str = Field(default="success", description="Processing status")
    message: str = Field(..., description="Human-readable status summary")


class ChatRequest(BaseModel):
    """Request payload for chatting with the uploaded document."""
    session_id: str = Field(..., min_length=1, description="Active session ID containing the document index")
    question: str = Field(..., min_length=1, max_length=2000, description="User's query about the document")


class SourceChunk(BaseModel):
    """Metadata and excerpt of a retrieved context chunk."""
    page: int = Field(..., description="1-indexed page number in the original PDF")
    content: str = Field(..., description="Text content extracted from this chunk")


class ChatResponse(BaseModel):
    """Response returned by the RAG pipeline."""
    answer: str = Field(..., description="Grounded LLM-generated answer")
    sources: List[SourceChunk] = Field(default_factory=list, description="Retrieved source document chunks")


class SessionStatusResponse(BaseModel):
    """Status details for an active session."""
    session_id: str
    filename: str
    total_pages: int
    total_chunks: int
    active: bool


class DeleteSessionResponse(BaseModel):
    """Response after deleting a session."""
    session_id: str
    status: str
    message: str


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    service: str
    embedding_model: str
    llm_model: str
