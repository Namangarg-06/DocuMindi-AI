"""
Utility script to generate a sample PDF document for testing the RAG application.
Run:
    python create_sample_pdf.py
Output:
    sample_document.pdf
"""

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os

def create_sample_pdf(filename="sample_document.pdf"):
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter

    # Page 1: Title and Overview
    c.setFont("Helvetica-Bold", 20)
    c.drawString(72, height - 72, "DocuMindi AI: Introduction to RAG Systems")

    c.setFont("Helvetica", 11)
    c.drawString(72, height - 110, "Author: DocuMindi Research Team")
    c.drawString(72, height - 128, "Date: November 2026 | Document ID: DM-2026-RAG")

    c.setFont("Helvetica-Bold", 14)
    c.drawString(72, height - 170, "1. Executive Summary")
    c.setFont("Helvetica", 10)
    text_p1 = (
        "Retrieval-Augmented Generation (RAG) is an architectural framework that enhances the accuracy "
        "and reliability of Generative Large Language Models (LLMs) by fetching relevant facts from external "
        "knowledge bases before formulating a response. Unlike standard fine-tuning, RAG decouples knowledge "
        "storage from model parameters, enabling immediate updates without expensive re-training."
    )
    text_obj = c.beginText(72, height - 195)
    text_obj.setFont("Helvetica", 10)
    text_obj.setTextOrigin(72, height - 195)
    for line in [
        "Retrieval-Augmented Generation (RAG) is an architectural framework that enhances the accuracy",
        "and reliability of Generative Large Language Models (LLMs) by fetching relevant facts from external",
        "knowledge bases before formulating a response. Unlike standard fine-tuning, RAG decouples knowledge",
        "storage from model parameters, enabling immediate updates without expensive re-training.",
        "",
        "Key Advantages of RAG:",
        "• Elimination of hallucinations by grounding LLM responses in verifiable source documents.",
        "• Full data privacy and zero parameter retention for sensitive organizational files.",
        "• Traceability with transparent source page citations for every generated answer."
    ]:
        text_obj.textLine(line)
    c.drawText(text_obj)

    c.setFont("Helvetica-Bold", 14)
    c.drawString(72, height - 350, "2. Core Architectural Components")
    text_obj2 = c.beginText(72, height - 375)
    text_obj2.setFont("Helvetica", 10)
    for line in [
        "The standard local RAG pipeline consists of three vital phases:",
        "1. Ingestion Phase: Documents are loaded via loaders (e.g., PyPDFLoader) and broken down into",
        "   smaller semantic chunks using RecursiveCharacterTextSplitter with chunk size 1000 and overlap 200.",
        "2. Embedding Phase: Each chunk is vectorized into high-dimensional space using Hugging Face's",
        "   lightweight 'all-MiniLM-L6-v2' model running entirely on CPU.",
        "3. Vector Indexing: Embeddings are loaded into an in-memory FAISS (Facebook AI Similarity Search) index."
    ]:
        text_obj2.textLine(line)
    c.drawText(text_obj2)
    c.showPage()

    # Page 2: Key Findings & Technical Benchmarks
    c.setFont("Helvetica-Bold", 16)
    c.drawString(72, height - 72, "DocuMindi AI: Key Findings & Evaluation")

    c.setFont("Helvetica-Bold", 14)
    c.drawString(72, height - 110, "3. Key Findings & Performance Metrics")
    text_obj3 = c.beginText(72, height - 135)
    text_obj3.setFont("Helvetica", 10)
    for line in [
        "Our empirical evaluation of the lightweight RAG architecture revealed the following findings:",
        "• Retrieval Speed: FAISS CPU performs similarity lookups across 10,000 chunks in under 4 milliseconds.",
        "• Embedding Efficiency: The sentence-transformers/all-MiniLM-L6-v2 model consumes less than 120MB of RAM,",
        "  making it ideal for resource-constrained educational environments and local laptops.",
        "• Context Precision: Utilizing a top-k chunk retrieval of 4 chunks yields 94.6% answer faithfulness",
        "  when evaluated against factual extraction benchmarks.",
        "• Groq LLM Acceleration: Groq's LPU inference hardware achieves speeds exceeding 250 tokens/sec,",
        "  providing nearly instantaneous conversational response times."
    ]:
        text_obj3.textLine(line)
    c.drawText(text_obj3)

    c.setFont("Helvetica-Bold", 14)
    c.drawString(72, height - 290, "4. Conclusion & Recommendations")
    text_obj4 = c.beginText(72, height - 315)
    text_obj4.setFont("Helvetica", 10)
    for line in [
        "In conclusion, a temporary, in-memory RAG system successfully solves the challenges of privacy,",
        "accuracy, and local hardware constraints. By keeping vector indices strictly in memory and destroying",
        "them upon session closure, user documents are never stored permanently.",
        "",
        "Recommendations for production deployment:",
        "1. Always enforce chunk overlap to prevent boundary truncation of essential sentences.",
        "2. Provide direct source page indicators to build user trust during answers.",
        "3. Configure strict system prompt rules to prevent prompt injection from document contents."
    ]:
        text_obj4.textLine(line)
    c.drawText(text_obj4)
    c.showPage()

    c.save()
    print(f"Sample PDF successfully generated: {os.path.abspath(filename)}")

if __name__ == "__main__":
    try:
        create_sample_pdf()
    except ImportError:
        print("ReportLab is not installed. Run `pip install reportlab` or use any PDF to test.")
