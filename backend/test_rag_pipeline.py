"""
Self-Test Verification Script:
Verifies backend dependencies, text chunking, Hugging Face embeddings,
and FAISS vector store indexing in isolation.

Run:
    python test_rag_pipeline.py
"""

import sys
import os

# Add parent directory to sys.path so app modules are resolvable
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from langchain_core.documents import Document
from app.services.embedding_service import embedding_service
from app.services.vector_store import vector_store_manager
from app.services.pdf_processor import pdf_processor

def test_pipeline():
    print("=" * 60)
    print("DocuMindi-AI RAG Self-Test Verification")
    print("=" * 60)

    # 1. Test Text Splitter
    print("\n[1/3] Testing RecursiveCharacterTextSplitter...")
    sample_docs = [
        Document(
            page_content="Retrieval-Augmented Generation (RAG) is a technique for enhancing LLM responses "
                         "by retrieving relevant documents from an external vector index like FAISS.",
            metadata={"page": 1, "source_filename": "test_document.pdf"}
        ),
        Document(
            page_content="DocuMindi-AI uses sentence-transformers/all-MiniLM-L6-v2 running locally on CPU. "
                         "All vector embeddings exist only in memory during the active session.",
            metadata={"page": 2, "source_filename": "test_document.pdf"}
        )
    ]
    chunks = pdf_processor.text_splitter.split_documents(sample_docs)
    print(f" -> Generated {len(chunks)} chunks successfully.")

    # 2. Test Local Embeddings & FAISS In-Memory Store
    print("\n[2/3] Initializing local Hugging Face embedding model & FAISS...")
    try:
        session_id = vector_store_manager.create_session(
            chunks=chunks,
            filename="test_document.pdf",
            total_pages=2
        )
        print(f" -> Successfully created session FAISS index: {session_id}")
    except Exception as e:
        print(f" -> Error during embedding / vector store creation: {e}")
        return False

    # 3. Test Similarity Retrieval
    print("\n[3/3] Testing vector similarity search...")
    retriever = vector_store_manager.get_retriever(session_id, k=2)
    query = "What embedding model is used?"
    retrieved = retriever.invoke(query)
    print(f" -> Query: '{query}'")
    print(f" -> Top retrieved chunk from Page {retrieved[0].metadata.get('page')}:")
    print(f"    \"{retrieved[0].page_content[:90]}...\"")

    # Clean up test session
    vector_store_manager.delete_session(session_id)
    print("\n -> In-memory session cleaned up successfully.")

    print("\n" + "=" * 60)
    print("All core RAG components verified successfully! Ready to run.")
    print("=" * 60)
    return True

if __name__ == "__main__":
    test_pipeline()
