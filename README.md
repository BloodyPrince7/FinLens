# FinLens AI

A personal AI financial companion: upload ITRs, bank statements, loan
agreements, and other financial documents to get plain-language
explanations, a Financial Health Score, loan/product affordability checks,
a What-If simulator, and transaction analysis — with a live conversational
AI assistant (voice + text, English/Hindi) grounded in your own data.

## Structure

- `frontend/` — React + Vite + Tailwind. Gemini chat is accessed through
  the authenticated backend; Convai lives on a separate advisor page.
  Tesseract.js handles client-side image OCR and Recharts powers charts.
- `backend/` — FastAPI. PyMuPDF handles PDF text extraction, Gemini 2.5 Flash
  powers financial chat and structured document analysis, and SQLite provides
  (via SQLAlchemy) for storage, and the EMI/DTI/health-score calculation
  endpoints.

## Running locally

```bash
# Backend
cd backend
python -m venv venv        # if not already created
venv\Scripts\activate       # Windows; source venv/bin/activate on macOS/Linux
pip install -r requirements.txt
cp .env.example .env        # add your server-side Gemini API key
uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env         # add the public Convai Experience ID
npm run dev
```

Open `http://localhost:5173/login` (demo login: `demo@finlens.ai` / `123456`).

## Notes

- Gemini powers text chat and document intelligence. `GEMINI_API_KEY` remains
  server-side in `backend/.env` and is never bundled into the browser.
- Convai is isolated to `/advisor` and uses the public Experience ID.
- FinLens AI provides educational financial information only - not a
  substitute for professional financial, tax, or legal advice.
