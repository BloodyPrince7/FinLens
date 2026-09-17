# Sahayak – AI Health Companion for Senior Citizens

A React + Vite healthcare assistant for senior citizens: a live conversational
AI (voice + text) that explains prescriptions and medical reports in simple
English or Hindi, with browser-based OCR for uploaded documents.

## Stack

- React + Vite, Tailwind CSS
- Convai Character REST API for conversation (proxied through a local Vite
  dev-server middleware so the API key never reaches the browser bundle)
- Web Speech API for voice input/output
- Tesseract.js for local, in-browser OCR

## Running locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and fill in your Convai credentials:

```
VITE_CONVAI_API_KEY=your_convai_api_key_here
VITE_CONVAI_CHARACTER_ID=your_character_id_here
```

Then open `http://localhost:5173/login` (demo login: `senior@demo.com` / `123456`).
