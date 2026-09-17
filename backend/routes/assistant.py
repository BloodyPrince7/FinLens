from fastapi import APIRouter, Depends, HTTPException

from models.db import User
from models.schemas import AssistantChatRequest, AssistantChatResponse
from services import gemini_service
from services.security import get_current_user

router = APIRouter(prefix="/api/assistant", tags=["assistant"])

SAFETY_INSTRUCTION = """You are FinLens AI, a careful and empathetic personal financial assistant.
Use the supplied user profile and document context to personalize the answer. Explain financial jargon
in plain language. Never guarantee approval, returns, tax outcomes, or legal outcomes. Do not invent
facts that are absent from the context. Clearly state uncertainty. Give educational guidance and suggest
a qualified financial, tax, or legal professional when the decision is high stakes."""


@router.post("/chat", response_model=AssistantChatResponse)
async def chat(payload: AssistantChatRequest, user: User = Depends(get_current_user)):
    language_instruction = (
        "Respond only in simple Hindi using Devanagari script."
        if payload.language == "hi"
        else "Respond only in simple English."
    )
    prompt = (
        f"{SAFETY_INSTRUCTION}\n\n{language_instruction}\n\n"
        f"Authenticated user: {user.name}\n\n"
        f"Financial context:\n{payload.dynamic_context or 'No additional context provided.'}\n\n"
        f"User question:\n{payload.question.strip()}"
    )
    try:
        selected_model = gemini_service.resolve_model(payload.model)
        answer = await gemini_service.generate_text(prompt, model=selected_model)
    except gemini_service.GeminiUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return AssistantChatResponse(success=True, answer=answer, model=selected_model)
