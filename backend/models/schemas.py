from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class UserOut(BaseModel):
    id: str
    name: str
    email: str


class LoginResponse(BaseModel):
    success: bool
    message: str
    user: Optional[UserOut] = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: str


class AssistantAnalyzeResponse(BaseModel):
    success: bool
    language: Literal["en", "hi"]
    answer: str
    document_context: str


DocumentType = Literal[
    "itr",
    "bank_statement",
    "salary_slip",
    "loan_agreement",
    "insurance_policy",
    "investment_statement",
    "credit_report",
]


class DocumentUploadResponse(BaseModel):
    success: bool
    id: str
    filename: str
    document_type: DocumentType
    summary: str
    fields: dict
    risks: list[str]


class DocumentOut(BaseModel):
    id: str
    filename: str
    document_type: DocumentType
    summary: str
    fields: dict
    risks: list[str]
    extracted_text: str


class EmiRequest(BaseModel):
    principal: float = Field(gt=0)
    annual_rate_percent: float = Field(ge=0)
    tenure_months: int = Field(gt=0)
    existing_emis: float = Field(default=0, ge=0)
    monthly_income: float = Field(default=0, ge=0)


class EmiResponse(BaseModel):
    emi: float
    total_interest: float
    total_repayment: float
    dti_percent: float
    affordability: Literal["Safe", "Moderate", "Stretched", "High Risk"]


class HealthScoreRequest(BaseModel):
    monthly_income: float = Field(ge=0)
    monthly_expenses: float = Field(ge=0)
    existing_emis: float = Field(default=0, ge=0)
    savings: float = Field(default=0, ge=0)


class HealthScoreResponse(BaseModel):
    score: int
    income_stability: str
    savings: str
    debt_burden: str
    cash_flow: str
