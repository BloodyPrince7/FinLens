# FinLens AI Frontend

A React + Vite personal-finance experience with Gemini-powered chat,
financial-document analysis, and a separate Convai advisor page.

## Stack

- React + Vite, Tailwind CSS
- Authenticated FastAPI backend for Gemini chat and document intelligence
- Dedicated Convai Experience page using only its public Experience ID
- Web Speech API for voice input/output
- Tesseract.js for local, in-browser OCR

## Running locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and add the public Convai Experience ID:

```
VITE_CONVAI_EXPERIENCE_ID=your_experience_id_here
```

Then open `http://localhost:5173/login` (demo login: `demo@finlens.ai` / `123456`).
"# FinLens" 
