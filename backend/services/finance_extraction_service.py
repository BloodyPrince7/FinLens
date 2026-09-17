"""
Structured financial-field extraction from raw document text via Gemini.
"""

import logging
import re
from typing import Literal

from services import gemini_service

logger = logging.getLogger(__name__)

DocumentType = Literal[
    "itr",
    "bank_statement",
    "salary_slip",
    "loan_agreement",
    "insurance_policy",
    "investment_statement",
    "credit_report",
]

FIELD_HINTS: dict[DocumentType, list[str]] = {
    "itr": [
        "assessment_year", "financial_year", "gross_total_income", "total_income",
        "taxable_income", "tax_paid", "tds", "employer_type", "salary_income",
        "business_income", "other_sources_income",
    ],
    "bank_statement": [
        "total_credits", "total_debits", "average_monthly_balance", "recurring_expenses",
        "salary_credits", "emi_payments", "suspicious_transactions", "large_transactions",
    ],
    "loan_agreement": [
        "loan_amount", "interest_rate", "tenure", "emi", "processing_fee", "gst_charges",
        "foreclosure_charges", "late_payment_penalty", "prepayment_conditions",
    ],
    "salary_slip": ["gross_salary", "net_salary", "deductions", "employer_name"],
    "insurance_policy": ["premium", "sum_assured", "policy_term", "exclusions"],
    "investment_statement": ["total_invested", "current_value", "instrument_types"],
    "credit_report": ["credit_score", "active_loans", "credit_utilization"],
}

def _build_prompt(document_type: DocumentType, extracted_text: str = "", has_file: bool = False) -> str:
    fields = FIELD_HINTS.get(document_type, ["key_facts"])
    source_desc = "visual document (image or document file)" if has_file else "document text below"
    context_part = f"\nDocument text:\n{extracted_text[:6000]}\n" if extracted_text else ""
    return f"""You are an expert financial document intelligence assistant. Carefully analyze the {source_desc} with high precision.

Document type: {document_type}
{context_part}
Perform the following tasks:
1. Extract exact, accurate financial figures from the document (never confuse symbols like ₹ with %, preserve Indian rupee symbols, percentages, monthly/annual frequencies, tenure, EMI, and interest rates).
2. Transcribe clean, readable text from the document.
3. Identify any important clauses, fees, penalties, prepayment conditions, or risks.

Respond with ONLY a valid JSON object (no markdown fences, no extra text) matching this schema:
{{
  "summary": "One or two concise, plain-language sentences summarizing the document type, provider/platform, and key figures",
  "extracted_text": "Clean, complete text transcribed from the document",
  "fields": {{ {", ".join(f'"{f}": "exact string value or null"' for f in fields)} }},
  "risks": ["list of important clauses, charges, penalties, or caveats - empty list if none found"]
}}

If a field is not present in the document, set its value to null. Do NOT invent numbers."""


def _match_value(text: str, labels: list[str], value_pattern: str) -> str | None:
    label_pattern = "|".join(re.escape(label) for label in labels)
    patterns = (
        rf"(?:{label_pattern})\s*(?:amount|is|of|:|-)?\s*({value_pattern})",
        rf"({value_pattern})\s*(?:as|for)?\s*(?:the\s+)?(?:{label_pattern})",
    )
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return re.sub(r"\s+", " ", match.group(1)).strip()
    return None


def _fallback_fields(document_type: DocumentType, text: str) -> dict:
    money = r"(?:₹|rs\.?|inr)?\s*\d[\d,]*(?:\.\d+)?(?:\s*(?:per\s+month|monthly|p\.?m\.?|per\s+year|annual(?:ly)?|p\.?a\.?))?"
    percent = r"\d+(?:\.\d+)?\s*%"
    duration = r"\d+\s*(?:months?|years?)"
    if document_type == "loan_agreement":
        return {
            "loan_amount": _match_value(text, ["loan amount", "principal amount", "sanctioned amount"], money),
            "interest_rate": _match_value(text, ["interest rate", "rate of interest"], percent),
            "tenure": _match_value(text, ["loan tenure", "tenure", "term"], duration),
            "emi": _match_value(text, ["monthly emi", "emi", "equated monthly instalment", "monthly installment"], money),
            "processing_fee": _match_value(text, ["processing fee", "processing charges"], money),
        }
    if document_type == "insurance_policy":
        return {
            "premium": _match_value(text, ["annual premium", "monthly premium", "premium"], money),
            "sum_assured": _match_value(text, ["sum assured", "sum insured", "coverage amount"], money),
            "policy_term": _match_value(text, ["policy term", "coverage term"], duration),
        }
    return {}


def _fallback_result(extracted_text: str, document_type: DocumentType) -> dict:
    return {
        "summary": (extracted_text[:300] + ("..." if len(extracted_text) > 300 else "")) if extracted_text else "Document uploaded.",
        "extracted_text": extracted_text,
        "fields": {key: value for key, value in _fallback_fields(document_type, extracted_text).items() if value},
        "risks": [],
    }


async def extract_financial_data(
    document_type: DocumentType,
    extracted_text: str = "",
    *,
    file_bytes: bytes | None = None,
    mime_type: str | None = None,
    model: str | None = None,
) -> dict:
    """
    Returns {"summary": str, "fields": dict, "risks": list[str], "extracted_text": str}.
    Uses Gemini Multimodal Vision when file_bytes is provided.
    Falls back to deterministic extraction if Gemini is unreachable.
    """
    has_file = bool(file_bytes and mime_type)
    prompt = _build_prompt(document_type, extracted_text, has_file=has_file)
    selected_model = gemini_service.resolve_model(model)

    try:
        parsed = await gemini_service.generate_json(
            prompt,
            model=selected_model,
            file_bytes=file_bytes,
            mime_type=mime_type,
        )
        return {
            "summary": parsed.get("summary") or _fallback_result(extracted_text, document_type)["summary"],
            "extracted_text": parsed.get("extracted_text") or extracted_text,
            "fields": parsed.get("fields") or {},
            "risks": parsed.get("risks") or [],
        }
    except (gemini_service.GeminiUnavailableError, ValueError, TypeError) as exc:
        logger.warning("Gemini extraction unavailable; using deterministic fallback: %s", exc)
        return _fallback_result(extracted_text, document_type)
