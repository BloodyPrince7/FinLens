from typing import Literal, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from models.schemas import AssistantAnalyzeResponse
from services import ai_service, image_service, mock_ocr

router = APIRouter(prefix="/api/assistant", tags=["assistant"])


@router.post("/analyze", response_model=AssistantAnalyzeResponse)
async def analyze(
    image: Optional[UploadFile] = File(None),
    question: Optional[str] = Form(None),
    language: Literal["en", "hi"] = Form(...),
) -> AssistantAnalyzeResponse:
    # image/question are Optional at the FastAPI layer on purpose: an empty
    # multipart field can make Starlette report it as "missing" rather than
    # empty, which would bypass these checks and return a generic 422
    # instead of the friendly {"success": false, "error": ...} contract.
    if not question or not question.strip():
        raise HTTPException(
            status_code=400,
            detail="Please enter a health-related question before asking Sahayak.",
        )
    if image is None or not image.filename:
        raise HTTPException(
            status_code=400,
            detail="Please upload an image before asking a question.",
        )

    stored_path = await image_service.save_uploaded_image(image)
    try:
        # Current: Image -> Mock OCR -> Convai
        # Future:  Image -> Amazon Textract -> Extracted Text -> Amazon Bedrock
        document_context = mock_ocr.extract_text_from_image(stored_path)
        answer = await ai_service.generate_response(
            question=question.strip(),
            extracted_text=document_context,
            language=language,
        )
    finally:
        # Medical images are processed in-memory/on-disk only for this request
        # and are not retained afterwards.
        image_service.delete_image(stored_path)

    if not answer or not answer.strip():
        raise HTTPException(
            status_code=502,
            detail="Sahayak could not generate a response right now. Please try again.",
        )

    return AssistantAnalyzeResponse(
        success=True,
        language=language,
        answer=answer,
        document_context=document_context,
    )
