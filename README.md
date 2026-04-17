# SukuuPath GH

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=220&color=0:0f172a,50:0f766e,100:f59e0b&text=SukuuPath%20GH&fontColor=ffffff&fontAlignY=38&desc=AI-powered%20academic%20support%20for%20Ghanaian%20students&descAlignY=60" alt="SukuuPath GH banner" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Outfit&weight=700&size=26&pause=1200&color=0F766E&center=true&vCenter=true&width=900&lines=Translate+learning+materials+across+local+languages;Generate+quizzes%2C+summaries%2C+and+study+notes;Chat+with+documents+and+support+student+success" alt="Typing intro" />
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Frontend-React%2019-0f172a?style=for-the-badge&logo=react" alt="React 19" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Backend-FastAPI-0f766e?style=for-the-badge&logo=fastapi" alt="FastAPI" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Hosting-Vercel-111827?style=for-the-badge&logo=vercel" alt="Vercel" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Auth-Firebase-f59e0b?style=for-the-badge&logo=firebase" alt="Firebase" /></a>
</p>

<p align="center">
  SukuuPath GH is a full-stack academic assistant built for Ghanaian tertiary education.
  It helps students and lecturers translate course material, simplify difficult content,
  generate quizzes, summarize notes, upload materials, and chat with documents in a more accessible way.
</p>

## Why This Project Stands Out

- Local-language learning support for Ghanaian students.
- AI workflows for translation, summarization, document Q&A, and quiz generation.
- Lecturer upload tools and feedback audit views.
- Firebase-backed user flows plus server-hosted AI endpoints.
- Vercel-friendly deployment path for a public production URL.

## Core Features

- `Authentication`: email/password login plus Google sign-in.
- `Translation Workspace`: translate academic content between English and supported local languages.
- `Simplifier`: convert difficult text into clearer study-friendly explanations.
- `Summaries`: generate revision notes, briefs, bullet points, and exam prep summaries.
- `AI Chat`: ask academic questions with role-aware prompting.
- `Document Workspace`: upload PDFs, DOCX, PPTX, or text files and chat with the extracted content.
- `Quiz Generator`: build multiple-choice, true/false, and short-answer quizzes from study materials.
- `Study Library`: persist generated outputs for later review.
- `Lecturer Tools`: upload materials and review student-facing academic assets.
- `Audit Dashboard`: capture and resolve feedback on AI-generated content.

## Product Architecture

```text
React + Vite frontend
        |
        |  /api/*
        v
FastAPI backend on Vercel Python runtime
        |
        |-- NextToken API for chat, simplify, summaries, quiz generation
        |-- Hugging Face hosted models for production translation
        |-- Firebase Realtime Database for app data
        |-- PostgreSQL via DATABASE_URL for hosted SQL persistence when needed
```

## Project Structure

```text
.
|- api/                    # Vercel Python entrypoint
|- backend/                # FastAPI app, DB config, Firebase integration
|- frontend/               # React + Vite client
|- training/               # Translation-model preparation and fine-tuning scripts
|- ghana_nlp_translation_datasets/
|- vercel.json             # Vercel build + route config
```

## Local Development

### 1. Backend

```powershell
cd backend
python -m pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Create `backend/.env` from [`backend/.env.example`](./backend/.env.example) and fill in your real values.

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Create `frontend/.env` from [`frontend/.env.example`](./frontend/.env.example).

## Environment Variables

### Backend

| Variable | Required | Purpose |
|---|---|---|
| `NEXTTOKEN_API_KEY` | Yes | Enables AI features powered by NextToken |
| `DATABASE_URL` | Recommended for production | Hosted SQL database connection |
| `FIREBASE_DATABASE_URL` | Yes | Firebase Realtime Database URL |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Yes for production | Firebase Admin service account JSON as a single-line string |
| `TRANSLATION_PROVIDER` | Optional | `nexttoken` or `huggingface` |
| `HUGGINGFACE_API_TOKEN` | If using Hugging Face | Token for hosted translation inference |
| `HUGGINGFACE_TRANSLATION_MODEL` | If using Hugging Face | Default translation model |
| `HUGGINGFACE_TRANSLATION_MODEL_MAP` | Optional | Per-language-pair model map JSON |

### Frontend

| Variable | Required | Purpose |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Yes | Firebase client config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase client config |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase client config |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Firebase client config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase client config |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase client config |
| `VITE_FIREBASE_MEASUREMENT_ID` | Optional | Firebase analytics config |

## Public Deployment on Vercel

This repository is already structured for Vercel deployment with:

- `frontend` built as a static Vite app
- `api/index.py` serving the FastAPI backend
- route rewrites defined in [`vercel.json`](./vercel.json)

### Recommended production setup

1. Push this repository to GitHub.
2. Import the repo into Vercel.
3. Add the backend and frontend environment variables in Vercel Project Settings.
4. Use a hosted database via `DATABASE_URL`.
5. Use `FIREBASE_SERVICE_ACCOUNT_JSON` instead of committing a credential file.
6. Use Hugging Face for translation models if the local training checkpoints are too large for serverless hosting.

### Notes for production reliability

- Do not commit `.env` files, Firebase admin credentials, local databases, or uploaded files.
- Do not deploy local fine-tuned checkpoints directly into Vercel serverless functions.
- Use hosted storage/database services for durable production data.
- Uploaded files stored only on the serverless filesystem are not durable across deployments.

## Training Workflow

The `training/` folder contains utilities for preparing Ghana NLP datasets and fine-tuning translation models.

Recommended first runs:

- `English -> Twi`
- `Twi -> English`
- `Ewe -> English`

Use Python `3.10` or `3.11` for model training to avoid PyTorch compatibility issues on very new Python releases.

## Security Checklist Before Publishing

- Rotate any API keys that were previously saved in local `.env` files.
- Keep Firebase Admin credentials out of the repository.
- Keep Vercel tokens and local environment files out of Git.
- Review Firebase security rules before going public.
- Add production domains to Firebase/Auth allowed origins.

## Suggested GitHub Repository Description

> AI-powered academic assistant for Ghanaian students with translation, summarization, document chat, quizzes, and lecturer tools.

## Demo

Add your live deployment URL here after Vercel goes live:

```text
Production URL: https://your-project-name.vercel.app
```

## Authors

Built by Jephthah Lanor and Nicholas Baffoe.

---

<p align="center">
  <strong>Built to make learning more accessible, local, and intelligent.</strong>
</p>
