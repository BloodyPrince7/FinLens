"""
SQLite persistence via SQLAlchemy. Local-only storage for the prototype -
uploaded documents are not retained beyond what's needed to serve
GET /api/documents/{id}; see routes/documents.py for the delete-after-read
policy discussion.
"""

import os
import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "finlens.db")
engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})


class Base(DeclarativeBase):
    pass


def _new_id() -> str:
    return uuid.uuid4().hex


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_new_id)
    filename: Mapped[str] = mapped_column(String)
    document_type: Mapped[str] = mapped_column(String)
    extracted_text: Mapped[str] = mapped_column(Text)
    summary: Mapped[str] = mapped_column(Text, default="")
    fields: Mapped[dict] = mapped_column(JSON, default=dict)
    risks: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))


class FinancialTwin(Base):
    __tablename__ = "financial_twins"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_new_id)
    name: Mapped[str] = mapped_column(String, default="")
    monthly_income: Mapped[float] = mapped_column(default=0)
    monthly_expenses: Mapped[float] = mapped_column(default=0)
    existing_emis: Mapped[float] = mapped_column(default=0)
    savings: Mapped[float] = mapped_column(default=0)
    risk_tolerance: Mapped[str] = mapped_column(String, default="Moderate")
    employment_type: Mapped[str] = mapped_column(String, default="")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )


def init_db() -> None:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    Base.metadata.create_all(engine)


def get_session() -> Session:
    return Session(engine)
