from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from models.db import Document, get_session
from models.schemas import DocumentOut, DocumentType, DocumentUploadResponse
from services import finance_extraction_service, pdf_service

router = APIRouter(prefix="/api/documents", tags=["documents"])

ALLOWED_PDF_TYPES = {"application/pdf"}


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    document_type: DocumentType = Form(...),
    file: Optional[UploadFile] = File(None),
    extracted_text: Optional[str] = Form(None),
):
    """
    Stage 1 of 2: extract text and store it (unanalyzed). PDFs are extracted
    here via PyMuPDF; for images, the frontend already ran Tesseract.js
    client-side and passes the result as `extracted_text` - this endpoint
    never re-implements image OCR server-side.
    """
    text = ""

    if file is not None and file.filename:
        contents = await file.read()
        if file.content_type not in ALLOWED_PDF_TYPES and not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail="Unable to process this document. Please try another file.",
            )
        try:
            text = pdf_service.extract_text_from_pdf(contents)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
    elif extracted_text and extracted_text.strip():
        text = extracted_text.strip()
    else:
        raise HTTPException(
            status_code=400,
            detail="We could not extract readable text. Please upload a clearer document.",
        )

    with get_session() as session:
        document = Document(
            filename=(file.filename if file else "uploaded-document"),
            document_type=document_type,
            extracted_text=text,
        )
        session.add(document)
        session.commit()
        session.refresh(document)

        return DocumentUploadResponse(
            success=True,
            id=document.id,
            filename=document.filename,
            document_type=document.document_type,
            summary="",
            fields={},
            risks=[],
        )


@router.post("/analyze", response_model=DocumentUploadResponse)
async def analyze_document(document_id: str = Form(...)):
    """Stage 2 of 2: runs the LLM-based structured extraction on a previously uploaded document."""
    with get_session() as session:
        document = session.get(Document, document_id)
        if document is None:
            raise HTTPException(status_code=404, detail="Document not found.")

        result = await finance_extraction_service.extract_financial_data(
            document.document_type, document.extracted_text
        )
        document.summary = result["summary"]
        document.fields = result["fields"]
        document.risks = result["risks"]
        session.commit()
        session.refresh(document)

        return DocumentUploadResponse(
            success=True,
            id=document.id,
            filename=document.filename,
            document_type=document.document_type,
            summary=document.summary,
            fields=document.fields,
            risks=document.risks,
        )


@router.get("/{document_id}", response_model=DocumentOut)
async def get_document(document_id: str):
    with get_session() as session:
        document = session.get(Document, document_id)
        if document is None:
            raise HTTPException(status_code=404, detail="Document not found.")
        return DocumentOut(
            id=document.id,
            filename=document.filename,
            document_type=document.document_type,
            summary=document.summary,
            fields=document.fields,
            risks=document.risks,
            extracted_text=document.extracted_text,
        )
