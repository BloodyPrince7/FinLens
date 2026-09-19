from fastapi import APIRouter
from config import settings

router = APIRouter(prefix="/api/convai", tags=["convai"])


@router.get("/config")
def get_convai_config():
    """Returns the configured Convai 3D Avatar Experience ID from backend settings."""
    exp_id = settings.resolved_convai_experience_id
    return {
        "experience_id": exp_id,
        "configured": bool(exp_id),
    }
