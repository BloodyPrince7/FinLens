# FinLens AI

A personal AI financial companion: upload ITRs, bank statements, loan
agreements, and other financial documents to get plain-language
explanations, a Financial Health Score, loan/product affordability checks,
a What-If simulator, and transaction analysis — with a live conversational
AI assistant (voice + text, English/Hindi) grounded in your own data.

## Structure

- `frontend/` — React + Vite + Tailwind. Conversation runs on Convai's
  Character REST API (proxied through a Vite dev-middleware so the API key
  stays server-side), Web Speech API for voice, Tesseract.js for
  client-side image OCR, Recharts for charts.
- `backend/` — FastAPI. PyMuPDF for PDF text extraction, Convai's REST API
  again for structured financial-field extraction from documents, SQLite
  (via SQLAlchemy) for storage, and the EMI/DTI/health-score calculation
  endpoints.

## Running locally

```bash
# Backend
cd backend
python -m venv venv        # if not already created
venv\Scripts\activate       # Windows; source venv/bin/activate on macOS/Linux
pip install -r requirements.txt
cp .env.example .env        # fill in your Convai credentials
uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env         # fill in your Convai credentials
npm run dev
```

Open `http://localhost:5173/login` (demo login: `demo@finlens.ai` / `123456`).

## Notes

- Convai's Pixel Streaming / Avatar Studio Experience Embed is **not** used
  for the live assistant — it requires domain whitelisting available only
  on a paid Convai plan. The `VITE_CONVAI_EXPERIENCE_ID` in `frontend/.env`
  is kept only to link out to the character's official public preview.
- FinLens AI provides educational financial information only - not a
  substitute for professional financial, tax, or legal advice.
