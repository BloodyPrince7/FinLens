import json
import os

from fastapi import APIRouter, HTTPException

from models.schemas import LoginRequest, LoginResponse, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])

USERS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "users.json")


def _load_users() -> list[dict]:
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)["users"]


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest) -> LoginResponse:
    """
    Mock, JSON-file-based authentication for the prototype.
    This will be replaced by Amazon Cognito in the future integration phase.
    """
    users = _load_users()
    match = next((u for u in users if u["email"].lower() == payload.email.lower()), None)

    if match is None or match["password"] != payload.password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return LoginResponse(
        success=True,
        message="Login successful",
        user=UserOut(id=match["id"], name=match["name"], email=match["email"]),
    )
