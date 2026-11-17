"""
PDF Upload Route:
Accepts a PDF upload via multipart/form-data, processes text chunks,
generates embeddings, and creates an in-memory session FAISS index.
"""

import logging
from fastapi import APIRouter, UploadFile, File, status
from app.models.schemas import UploadResponse
from app.services.pdf_processor import pdf_processor
from app.services.vector_store import vector_store_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Document Upload"])


@router.post(
    "/upload",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and index a PDF document"
)
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload a PDF document.
    - Validates file type and size.
    - Extracts text and splits it into semantic chunks.
    - Computes local Hugging Face vector embeddings.
    - Creates a temporary, in-memory FAISS index bound to a new session ID.
    - Cleans up the temporary file immediately.
    """
    # 1. Validate file format and size
    content = await pdf_processor.validate_upload(file)
    filename = file.filename or "uploaded_document.pdf"

    # 2. Extract and chunk text
    chunks, total_pages = pdf_processor.process_pdf(content, filename)

    # 3. Create in-memory FAISS vector store
    session_id = vector_store_manager.create_session(
        chunks=chunks,
        filename=filename,
        total_pages=total_pages
    )

    logger.info(f"Successfully processed upload '{filename}' into session {session_id}")

    return UploadResponse(
        session_id=session_id,
        filename=filename,
        total_pages=total_pages,
        total_chunks=len(chunks),
        status="success",
        message=f"Successfully extracted {total_pages} page(s) into {len(chunks)} indexed chunks."
    )
