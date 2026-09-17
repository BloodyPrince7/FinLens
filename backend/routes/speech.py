import io
import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field
from gtts import gTTS

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/speech", tags=["speech"])


class TTSRequest(BaseModel):
    text: str = Field(min_length=1, max_length=10000)
    language: str = Field(default="hi")


@router.post("/tts")
def text_to_speech(payload: TTSRequest):
    """
    Generates authentic, high-definition native spoken audio (MP3) via Google TTS.
    Guarantees crystal-clear Hindi pronunciation even when Windows or the user's
    browser does not have a native Hindi TTS voice pack installed.
    """
    raw_text = payload.text.strip()
    if not raw_text:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    # Clean any markdown or formatting symbols before passing to TTS
    clean = raw_text.replace("*", " ").replace("#", " ").replace("`", " ")
    clean = " ".join(clean.split())
    if not clean:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    is_hindi = payload.language == "hi" or any("\u0900" <= ch <= "\u097f" for ch in clean)
    lang = "hi" if is_hindi else "en"
    tld = "co.in"

    try:
        tts = gTTS(text=clean, lang=lang, tld=tld)
        buf = io.BytesIO()
        tts.write_to_fp(buf)
        buf.seek(0)
        return Response(content=buf.getvalue(), media_type="audio/mpeg")
    except Exception as exc:
        logger.error("TTS generation failed: %s", exc)
        raise HTTPException(status_code=500, detail="Unable to generate speech audio right now.") from exc

