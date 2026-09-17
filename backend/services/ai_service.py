"""
AI response generation via the Convai Character API.

This is the temporary stand-in for Amazon Bedrock. Swap `generate_response`
for a Bedrock-backed `generate_response_using_bedrock(...)` later - the
signature (question, extracted_text, language) -> answer stays the same, so
routes/assistant.py never needs to change.
"""

import logging
from typing import Literal

import httpx

from config import settings

logger = logging.getLogger(__name__)

CONVAI_GET_RESPONSE_URL = "https://api.convai.com/character/getResponse"

PROMPT_TEMPLATE_EN = """You are Sahayak, an AI health companion for senior citizens.

Respond only in English.

User Question:
{question}

Medical Document Information:
{extracted_text}

Instructions:
- Use simple and understandable language.
- Be respectful and patient.
- Do not claim to be a doctor.
- Do not provide definitive diagnoses.
- Do not independently prescribe medicines.
- Do not recommend medication dosage without professional medical advice.
- Encourage consultation with a qualified doctor or pharmacist.
- If the document information is unclear, explicitly mention the limitation.
- If emergency symptoms are mentioned, advise seeking immediate medical attention.

Provide general educational health information only."""

PROMPT_TEMPLATE_HI = """आप Sahayak हैं, वरिष्ठ नागरिकों के लिए एक AI स्वास्थ्य सहायक।

केवल हिंदी भाषा में उत्तर दें।

उपयोगकर्ता का प्रश्न:
{question}

मेडिकल दस्तावेज़ की जानकारी:
{extracted_text}

निर्देश:
- सरल और आसानी से समझ आने वाली हिंदी में उत्तर दें।
- विनम्र, धैर्यवान और सहायक रहें।
- स्वयं को डॉक्टर न बताएं।
- निश्चित बीमारी का निदान न करें।
- स्वतंत्र रूप से दवाएं निर्धारित न करें।
- डॉक्टर की सलाह के बिना दवा की मात्रा या उपचार की सलाह न दें।
- योग्य डॉक्टर या फार्मासिस्ट से परामर्श लेने की सलाह दें।
- यदि दस्तावेज़ की जानकारी स्पष्ट नहीं है, तो इसकी सीमा बताएं।
- आपातकालीन लक्षण होने पर तुरंत चिकित्सा सहायता लेने की सलाह दें।

केवल सामान्य स्वास्थ्य संबंधी शैक्षिक जानकारी प्रदान करें।"""


def build_prompt(question: str, extracted_text: str, language: Literal["en", "hi"]) -> str:
    template = PROMPT_TEMPLATE_HI if language == "hi" else PROMPT_TEMPLATE_EN
    return template.format(question=question, extracted_text=extracted_text)


def _fallback_response(extracted_text: str, language: Literal["en", "hi"]) -> str:
    """
    Used when Convai credentials are not configured or the API call fails,
    so the demo keeps working offline. Replace/remove once real credentials
    are always available.
    """
    if language == "hi":
        return (
            "मैं आपके सवाल को समझ गया हूँ। उपलब्ध दस्तावेज़ के अनुसार जानकारी: "
            f"{extracted_text}\n\n"
            "कृपया ध्यान रखें कि मैं डॉक्टर नहीं हूँ और निश्चित निदान या दवा की सलाह नहीं दे सकता। "
            "किसी भी दवा या उपचार से पहले कृपया एक योग्य डॉक्टर या फार्मासिस्ट से सलाह लें।"
        )
    return (
        "I understand your question. Based on the available document, here is the information: "
        f"{extracted_text}\n\n"
        "Please note that I am not a doctor and cannot provide a definitive diagnosis or medication "
        "advice. Please consult a qualified doctor or pharmacist before taking any medication."
    )


async def generate_response(
    question: str,
    extracted_text: str,
    language: Literal["en", "hi"],
) -> str:
    """
    Builds a safe, language-specific prompt and calls the Convai Character
    API to get Sahayak's response. Falls back to a canned safe response if
    Convai is not configured or unreachable, so the prototype still works
    without live credentials.
    """
    prompt = build_prompt(question, extracted_text, language)

    if not settings.convai_api_key or not settings.convai_character_id:
        logger.warning("Convai credentials not configured; returning fallback response.")
        return _fallback_response(extracted_text, language)

    payload = {
        "userText": prompt,
        "charID": settings.convai_character_id,
        "sessionID": "-1",
        "voiceResponse": "False",
    }
    # Convai's API requires multipart/form-data even for text-only fields.
    multipart_fields = {key: (None, str(value)) for key, value in payload.items()}

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                CONVAI_GET_RESPONSE_URL,
                headers={"CONVAI-API-KEY": settings.convai_api_key},
                files=multipart_fields,
            )
            response.raise_for_status()
            data = response.json()
            answer = (data.get("text") or "").strip()
            if not answer:
                logger.warning("Convai returned an empty response; using fallback.")
                return _fallback_response(extracted_text, language)
            return answer
    except (httpx.HTTPError, ValueError) as exc:
        logger.error("Convai API call failed: %s", exc)
        return _fallback_response(extracted_text, language)
