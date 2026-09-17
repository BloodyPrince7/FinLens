"""
Structured financial-field extraction from raw document text, via Convai's
Character REST API (same call pattern as services/ai_service.py) - reused
here as a general-purpose LLM call rather than a live conversation turn, by
asking it to return JSON only.
"""

import json
import logging
import re
from typing import Literal

import httpx

from config import settings

logger = logging.getLogger(__name__)

CONVAI_GET_RESPONSE_URL = "https://api.convai.com/character/getResponse"

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

_JSON_BLOCK_RE = re.compile(r"\{.*\}", re.DOTALL)


def _build_prompt(document_type: DocumentType, extracted_text: str) -> str:
    fields = FIELD_HINTS.get(document_type, ["key_facts"])
    return f"""You are a financial document analysis assistant. Extract structured
information from the document text below.

Document type: {document_type}

Document text:
{extracted_text[:6000]}

Respond with ONLY a valid JSON object (no other text, no markdown fences) with this shape:
{{
  "summary": "one or two plain-language sentences summarizing this document",
  "fields": {{ {", ".join(f'"{f}": "value or null"' for f in fields)} }},
  "risks": ["any fees, penalties, or important clauses to flag - empty list if none found"]
}}

If a field cannot be found in the text, use null. Do not invent numbers."""


def _fallback_result(extracted_text: str) -> dict:
    return {
        "summary": extracted_text[:300] + ("..." if len(extracted_text) > 300 else ""),
        "fields": {},
        "risks": [],
    }


async def extract_financial_data(document_type: DocumentType, extracted_text: str) -> dict:
    """
    Returns {"summary": str, "fields": dict, "risks": list[str]}. Falls back
    to a raw-text summary (never an error/blank screen) if Convai is
    unreachable or doesn't return parseable JSON.
    """
    if not settings.convai_api_key or not settings.convai_character_id:
        logger.warning("Convai credentials not configured; returning fallback extraction.")
        return _fallback_result(extracted_text)

    prompt = _build_prompt(document_type, extracted_text)
    payload = {
        "userText": prompt,
        "charID": settings.convai_character_id,
        "sessionID": "-1",
        "voiceResponse": "False",
    }
    multipart_fields = {key: (None, str(value)) for key, value in payload.items()}

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                CONVAI_GET_RESPONSE_URL,
                headers={"CONVAI-API-KEY": settings.convai_api_key},
                files=multipart_fields,
            )
            response.raise_for_status()
            data = response.json()
            raw_text = (data.get("text") or "").strip()

            match = _JSON_BLOCK_RE.search(raw_text)
            if not match:
                logger.warning("No JSON block in Convai extraction response: %r", raw_text)
                return _fallback_result(extracted_text)

            parsed = json.loads(match.group(0))
            return {
                "summary": parsed.get("summary") or _fallback_result(extracted_text)["summary"],
                "fields": parsed.get("fields") or {},
                "risks": parsed.get("risks") or [],
            }
    except (httpx.HTTPError, ValueError, json.JSONDecodeError) as exc:
        logger.error("Financial extraction failed: %s", exc)
        return _fallback_result(extracted_text)
