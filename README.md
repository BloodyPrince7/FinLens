# 🔍 FinLens AI — Personal AI Financial Command Centre

> **Understand financial documents in plain English and Hindi, check loan affordability, simulate life events with your Financial Twin, and consult with a live 3D conversational advisor.**

[![Frontend - Vercel](https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square&logo=vercel)](https://fin-lens-jyy5.vercel.app)
[![Backend - Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render)](https://finlens-1-7sf7.onrender.com)
[![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/UI-React%2018-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=flat-square&logo=google)](https://ai.google.dev)
[![Convai](https://img.shields.io/badge/Avatar-Convai-7B2CBF?style=flat-square)](https://convai.com)

---

## 🌐 Live Deployments & Demo Access

| Service | URL | Notes |
| :--- | :--- | :--- |
| **Official Website** | [https://www.arvronline.in](https://www.arvronline.in) | Custom domain with full SSL |
| **Vercel Production App** | [https://fin-lens-jyy5.vercel.app](https://fin-lens-jyy5.vercel.app) | Production SPA frontend |
| **Render API Service** | [https://finlens-1-7sf7.onrender.com](https://finlens-1-7sf7.onrender.com) | FastAPI cloud backend |
| **Interactive API Docs** | [https://finlens-1-7sf7.onrender.com/docs](https://finlens-1-7sf7.onrender.com/docs) | Swagger UI for exploring endpoints |

### 🔑 Demo Account
- **Email:** demo@finlens.ai
- **Password:** 123456
- **Preloaded Profile:** Rahul Sharma (Salaried, Monthly Income: ₹70,833, Expenses: ₹32,000, EMIs: ₹14,000)

---

## ✨ Key Features

### 1. 📄 Multilingual Financial Document Intelligence
- Upload PDFs, scanned documents, and images: **Loan Agreements**, **Income Tax Returns (ITR)**, **Salary Slips**, **Insurance Policies**, **Form 16**, and **Bank Statements**.
- Automated text extraction combining server-side **PyMuPDF** and client-side **Tesseract.js** OCR.
- Deep document breakdown: Executive summary, extracted key terms (interest rates, tenure, penalties, hidden fees), and flagged risk factors.

### 2. 🇮🇳 हिंदी में समझें और सुनें (Hindi Document Reading & HD Audio Readout)
- **Plain Hindi Breakdown:** Automatically transforms dense legal/banking jargon into conversational, everyday Devanagari Hindi.
- **Universal Voice Output:** Uses server-side Google Text-to-Speech (POST /api/speech/tts) streaming directly to the browser.
- **Works Everywhere:** Guaranteed audio playback across Windows, macOS, Linux, iOS, and Android — completely bypassing missing OS Hindi voice packs.

### 3. 👤 3D Conversational Avatar Advisor (Convai)
- Live, voice-first interactive financial consultation with a 3D AI avatar powered by **Convai**.
- **Dynamic Character Switching:** Change or update Convai Experience IDs on-the-fly directly in the web UI without redeploying.
- **Persistent Settings:** Preserves user configuration in local storage.

### 4. 📊 Dynamic Financial Twin & Health Score
- Aggregates your cash flows, debt burden, savings ratio, and emergency funds into a unified **Financial Health Score** (0–100).
- Calculates Surplus, Debt-to-Income (DTI) ratio, and identifies vulnerabilities.
- **What-If Sandbox:** Simulate future life scenarios — taking a new home loan, changing monthly savings, salary increments, or unplanned medical expenses.

### 5. 🧠 Multi-Model Gemini Intelligence
- Powered by Google Gemini (Gemini 3.6 Flash / 2.0 Flash / 1.5 Flash).
- Automatic model failover logic and structured JSON response parsing.
- Server-side API key isolation: Your GEMINI_API_KEY never leaks to client-side code.

---

## 🏛️ System Architecture

`	ext
       ┌────────────────────────────────────────────────────────┐
       │             User Browser (PC / Mobile)                 │
       │    https://www.arvronline.in / https://...vercel.app   │
       └─────────────────────────┬──────────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼                               ▼
       ┌───────────────────┐           ┌───────────────────┐
       │   React 18 + Vite │           │ 3D Convai Avatar  │
       │  (Vercel Hosting) │           │ (x.convai.com)    │
       └─────────┬─────────┘           └───────────────────┘
                 │
                 │ HTTPS / REST (JWT Bearer Auth)
                 ▼
       ┌────────────────────────────────────────────────────────┐
       │          FastAPI Cloud Service (Render)                │
       │      - Dynamic CORS & ASGI Path Normalization          │
       │      - Session & User Auth Management                  │
       │      - SQLite Persistence via SQLAlchemy               │
       │      - Financial Math (EMI, DTI, Health Scoring)       │
       └──────────────┬──────────────────────────┬──────────────┘
                      │                          │
                      ▼                          ▼
       ┌────────────────────────┐      ┌────────────────────────┐
       │   Google Gemini API    │      │  Google TTS Streaming  │
       │ (Document Insights     │      │ (Server-side HD Hindi  │
       │  & Hindi Explanations) │      │  Voice Synthesis)      │
       └────────────────────────┘      └────────────────────────┘
`

---

## 📁 Repository Structure

`	ext
FinLens/
├── backend/
│   ├── data/                 # SQLite database & demo seed data
│   ├── models/               # SQLAlchemy models & Pydantic schemas
│   ├── routes/               # API endpoints
│   │   ├── assistant.py      # Multimodal Gemini Q&A
│   │   ├── auth.py           # Authentication & session tokens
│   │   ├── documents.py      # Document upload, OCR & Hindi analysis
│   │   ├── finance.py        # Health score, twin & What-If simulator
│   │   ├── profile.py        # User profile & financial twin endpoints
│   │   └── speech.py         # Google TTS server streaming endpoint
│   ├── services/             # Gemini SDK, PDF parser, calculations
│   ├── config.py             # App settings & CORS resolution
│   ├── main.py               # FastAPI entry point & ASGI middlewares
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Backend environment template
├── frontend/
│   ├── src/
│   │   ├── components/       # UI cards, headers, speech controls
│   │   ├── context/          # Financial twin state provider
│   │   ├── pages/            # Dashboard, Documents, Advisor, Insights, Login
│   │   ├── services/         # API client, Gemini, Speech & Finance services
│   │   ├── App.jsx           # Routing & layout wrapper
│   │   └── main.jsx          # React DOM entry point
│   ├── vercel.json           # Vercel SPA routing rules
│   ├── package.json          # Node dependencies & Vite scripts
│   └── .env.example          # Frontend environment template
├── render.yaml               # Render Infrastructure Blueprint
└── README.md                 # Project documentation
`

---

## 💻 Local Development Setup

### Prerequisites
- **Python 3.11+** installed
- **Node.js 18+** and 
pm installed
- A **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

---

### Step 1: Backend Setup

`ash
# 1. Open a terminal and navigate to backend
cd backend

# 2. Create and activate a Python virtual environment
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env and paste your GEMINI_API_KEY

# 5. Start the FastAPI server
uvicorn main:app --reload --port 8000
`
Backend API will be running at http://localhost:8000 (Docs at http://localhost:8000/docs).

---

### Step 2: Frontend Setup

`ash
# 1. Open a second terminal and navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env

# 4. Start Vite development server
npm run dev
`
Frontend will be running at http://localhost:5173.

---

## ⚙️ Environment Variables Reference

### Backend (ackend/.env)
| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| GEMINI_API_KEY | **Yes** | — | Google Gemini API Key from Google AI Studio |
| GEMINI_MODEL | No | gemini-3.6-flash | Gemini model name (gemini-2.0-flash, etc.) |
| FRONTEND_URL | No | http://localhost:5173 | Allowed origins for CORS (comma-separated) |

### Frontend (rontend/.env or Vercel Environment Variables)
| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| VITE_API_BASE_URL | No | http://localhost:8000 | Backend API URL (e.g. https://finlens-1-7sf7.onrender.com) |
| VITE_CONVAI_EXPERIENCE_ID | No | — | Convai 3D avatar Experience ID *(can also be entered in the UI)* |

---

## 🚀 Cloud Deployment

### Frontend (Vercel)
1. Import repository on [Vercel](https://vercel.com).
2. Set **Root Directory** to rontend.
3. Add Environment Variable:
   - VITE_API_BASE_URL = https://finlens-1-7sf7.onrender.com
4. Deploy! Rewrites are handled automatically via rontend/vercel.json.

### Backend (Render)
1. Create a new **Web Service** on [Render](https://render.com).
2. Set **Root Directory** to ackend.
3. Set **Build Command:** pip install -r requirements.txt.
4. Set **Start Command:** uvicorn main:app --host 0.0.0.0 --port .
5. Add Environment Variables: GEMINI_API_KEY, PYTHON_VERSION=3.11.9.

### Custom Domain (GoDaddy DNS)
- **A Record:** @ ➔ 76.76.21.21 (Vercel)
- **CNAME Record:** www ➔ cname.vercel-dns.com (Vercel)
- Remove any existing HTTP Forwarding rules in GoDaddy so root and subdomains route cleanly to Vercel.

---

## 🛡️ Security & Privacy Notice

- **Ephemeral Document Processing:** Document binaries are processed during the active user session and are not permanently shared with third parties.
- **Server-Side Credential Isolation:** All Gemini API keys and credentials reside strictly on the backend server.
- **Educational Disclaimer:** *FinLens AI provides educational financial analysis and AI-driven document interpretations for informational purposes only. It does not constitute certified legal, tax, or financial advice.*