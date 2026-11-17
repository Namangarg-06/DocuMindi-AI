"""
PDF Processing Service:
Handles validation, temporary file creation, text extraction,
and chunking using LangChain's RecursiveCharacterTextSplitter.
"""

import os
import tempfile
import logging
from typing import List, Tuple
from fastapi import UploadFile, HTTPException, status
from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf.errors import PdfReadError, FileNotDecryptedError

from app.config import settings

logger = logging.getLogger(__name__)


class PDFProcessor:
    """Service to safely process and chunk uploaded PDF files."""

    def __init__(self, chunk_size: int = settings.CHUNK_SIZE, chunk_overlap: int = settings.CHUNK_OVERLAP):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            separators=["\n\n", "\n", " ", ""],
            length_function=len,
            is_separator_regex=False
        )

    async def validate_upload(self, file: UploadFile) -> bytes:
        """
        Validate file extension, mime type, size, and magic bytes.
        Returns file content bytes if valid.
        """
        # 1. Filename validation
        filename = file.filename or ""
        if not filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file extension for '{filename}'. Only .pdf files are accepted."
            )

        # 2. Read file content
        content = await file.read()
        if not content or len(content) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded file is empty (0 bytes)."
            )

        # 3. Check file size
        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if len(content) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
            )

        # 4. Check PDF magic bytes (%PDF)
        if not content.startswith(b"%PDF"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file header does not match a valid PDF format (%PDF header missing)."
            )

        return content

    def process_pdf(self, content: bytes, original_filename: str) -> Tuple[List[Document], int]:
        """
        Extract text from PDF bytes, split into chunks with preserved page metadata,
        and cleanly delete the temporary file after processing.
        Returns:
            Tuple[List[Document], int]: (chunked_documents, total_pages)
        """
        temp_pdf_path = None
        try:
            # 1. Write to temporary file for PyPDFLoader
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
                tmp_file.write(content)
                temp_pdf_path = tmp_file.name

            # 2. Load PDF documents with PyPDFLoader
            try:
                loader = PyPDFLoader(temp_pdf_path)
                pages = loader.load()
            except FileNotDecryptedError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="The uploaded PDF is password-protected. Please provide an unencrypted PDF."
                )
            except PdfReadError as pe:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"The uploaded PDF is corrupted or could not be read: {str(pe)}"
                )
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to parse PDF document: {str(e)}"
                )

            total_pages = len(pages)
            if total_pages == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="The uploaded PDF contains 0 readable pages."
                )

            # 3. Verify that pages contain extractable text
            non_empty_pages = [p for p in pages if p.page_content and p.page_content.strip()]
            if not non_empty_pages:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="The PDF contains no extractable text. It may contain only scanned images without OCR."
                )

            # 4. Process each page and extract chunks with EXACT line numbers
            all_chunks: List[Document] = []

            for page in pages:
                page_text = page.page_content or ""
                raw_page = page.metadata.get("page", 0)
                try:
                    page_num = int(raw_page) + 1
                except (ValueError, TypeError):
                    page_num = 1

                # Split this specific page into chunks
                page_split_texts = self.text_splitter.split_text(page_text)
                search_cursor = 0

                for chunk_text in page_split_texts:
                    clean_chunk = chunk_text.strip()
                    if not clean_chunk:
                        continue

                    # Find where this chunk occurs in the page text to get exact line numbers
                    # Look up first 40 characters of chunk
                    match_needle = clean_chunk[:40] if len(clean_chunk) >= 40 else clean_chunk
                    char_idx = page_text.find(match_needle, search_cursor)
                    if char_idx == -1:
                        char_idx = search_cursor

                    # Count newlines to calculate line numbers
                    start_line = page_text[:char_idx].count('\n') + 1
                    chunk_newline_count = clean_chunk.count('\n')
                    end_line = start_line + chunk_newline_count

                    line_range = f"Line {start_line}" if start_line == end_line else f"Lines {start_line}-{end_line}"
                    search_cursor = char_idx + len(clean_chunk)

                    chunk_doc = Document(
                        page_content=clean_chunk,
                        metadata={
                            "page": page_num,
                            "line_start": start_line,
                            "line_end": end_line,
                            "line_range": line_range,
                            "source_filename": original_filename
                        }
                    )
                    all_chunks.append(chunk_doc)

            if not all_chunks:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No valid text chunks could be produced from this PDF."
                )

            logger.info(
                f"Processed '{original_filename}': {total_pages} pages -> {len(all_chunks)} chunks with exact line numbers "
                f"(chunk_size={self.chunk_size}, overlap={self.chunk_overlap})"
            )

            return all_chunks, total_pages

        finally:
            # 6. Strict cleanup of temporary file on disk
            if temp_pdf_path and os.path.exists(temp_pdf_path):
                try:
                    os.remove(temp_pdf_path)
                    logger.debug(f"Removed temporary file: {temp_pdf_path}")
                except Exception as ex:
                    logger.warning(f"Failed to remove temporary file {temp_pdf_path}: {ex}")


# Singleton instance
pdf_processor = PDFProcessor()
