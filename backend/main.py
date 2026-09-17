from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from models.db import init_db
from routes import assistant, auth, documents, finance, profile, speech

app = FastAPI(
    title="FinLens AI API",
    description="Gemini-powered document intelligence and financial guidance for FinLens AI.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()
    auth.seed_demo_users()


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": exc.detail},
    )


app.include_router(auth.router)
app.include_router(assistant.router)
app.include_router(documents.router)
app.include_router(finance.router)
app.include_router(profile.router)
app.include_router(speech.router)


@app.get("/api/health")
def health_check():
    return {"success": True, "message": "FinLens AI backend is running."}
