# AI Career Advisor — FastAPI Backend

A production-ready FastAPI backend powering personalised career guidance via **Google Gemini 2.5 Flash**, **Supabase PostgreSQL**, and **Supabase Auth**.

---

## Folder Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app factory, routers, lifespan
│   ├── config.py            # Pydantic Settings (env vars)
│   ├── database.py          # Async SQLAlchemy engine + session
│   ├── models/
│   │   └── __init__.py      # All ORM models
│   ├── schemas/
│   │   └── __init__.py      # All Pydantic request/response schemas
│   ├── routers/
│   │   ├── auth.py          # /api/v1/auth/*
│   │   ├── profile.py       # /api/v1/profile/*
│   │   ├── career.py        # /api/v1/career/*
│   │   ├── resume.py        # /api/v1/resume/*
│   │   ├── skills.py        # /api/v1/skills/*
│   │   ├── roadmap.py       # /api/v1/roadmap/*
│   │   └── chat.py          # /api/v1/chat/*
│   ├── services/
│   │   ├── gemini.py        # Gemini AI wrapper
│   │   └── auth.py          # Supabase Auth helpers
│   ├── middleware/
│   │   └── auth.py          # JWT dependency (get_current_user)
│   └── utils/
│       └── pdf.py           # PDF text extraction
├── supabase_schema.sql      # Full Supabase DB schema with RLS
├── requirements.txt
├── .env.example
└── README.md
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.11+ |
| pip | latest |
| Supabase account | — |
| Google AI Studio API key | — |

---

## Quick Start

### 1. Clone and create a virtual environment

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your real credentials
```

Required values in `.env`:

| Variable | Where to find it |
|----------|-----------------|
| `SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API |
| `SUPABASE_JWT_SECRET` | Supabase Dashboard → Project Settings → API → JWT Secret |
| `DATABASE_URL` | `postgresql+asyncpg://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres` |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |

### 4. Set up the Supabase database

Open the **Supabase SQL Editor** and run the entire contents of `supabase_schema.sql`.
This creates all tables, indexes, triggers, and Row-Level Security policies.

### 5. Run the development server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Base**: `http://localhost:8000/api/v1`
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **Health Check**: `http://localhost:8000/health`

---

## API Endpoints

### Authentication `/api/v1/auth`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/auth/register` | Register new user | ❌ |
| `POST` | `/auth/login` | Login → get JWT | ❌ |
| `GET`  | `/auth/me` | Get current user profile | ✅ |

### Student Profile `/api/v1/profile`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET`  | `/profile` | Get profile | ✅ |
| `PUT`  | `/profile` | Update profile | ✅ |
| `DELETE` | `/profile` | Delete profile | ✅ |

### Career Recommendations `/api/v1/career`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/career/recommend` | Generate AI recommendations | ✅ |
| `GET`  | `/career/recommendations` | List all recommendations | ✅ |
| `GET`  | `/career/recommendations/{id}` | Get single recommendation | ✅ |

### Resume Analyzer `/api/v1/resume`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/resume/analyze` | Upload PDF + analyze | ✅ |
| `GET`  | `/resume/analyses` | List all analyses | ✅ |
| `GET`  | `/resume/analyses/{id}` | Get single analysis | ✅ |

### Skill Gap Analysis `/api/v1/skills`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/skills/gap-analysis` | Run skill gap analysis | ✅ |
| `GET`  | `/skills/gap-analyses` | List analyses | ✅ |
| `GET`  | `/skills/gap-analyses/{id}` | Get single analysis | ✅ |

### Learning Roadmap `/api/v1/roadmap`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/roadmap/generate` | Generate roadmap | ✅ |
| `GET`  | `/roadmap/roadmaps` | List roadmaps | ✅ |
| `GET`  | `/roadmap/roadmaps/{id}` | Get roadmap | ✅ |
| `DELETE` | `/roadmap/roadmaps/{id}` | Delete roadmap | ✅ |

### AI Chatbot `/api/v1/chat`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/chat/message` | Send message (auto-creates session) | ✅ |
| `GET`  | `/chat/sessions` | List all sessions | ✅ |
| `GET`  | `/chat/sessions/{id}` | Get session + messages | ✅ |
| `DELETE` | `/chat/sessions/{id}` | Delete session | ✅ |

---

## Frontend Integration

All protected endpoints expect the Supabase JWT in the `Authorization` header:

```
Authorization: Bearer <supabase_access_token>
```

Example React/Axios setup:

```typescript
// api/client.ts
import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({ baseURL: 'http://localhost:8000/api/v1' });

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) {
    config.headers.Authorization = `Bearer ${data.session.access_token}`;
  }
  return config;
});

export default api;
```

---

## Deployment

### Docker (Recommended)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t career-advisor-api .
docker run -p 8000:8000 --env-file .env career-advisor-api
```

### Railway / Render / Fly.io

1. Push your code to GitHub
2. Connect the repo to your platform
3. Set all environment variables from `.env.example`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Production checklist

- [ ] Set `DEBUG=false`
- [ ] Update `ALLOWED_ORIGINS` to your deployed frontend URL
- [ ] Use Alembic for database migrations instead of `create_all`
- [ ] Add rate limiting (e.g. `slowapi`)
- [ ] Add logging with structlog or loguru
- [ ] Set up Sentry for error tracking
- [ ] Use a secrets manager for environment variables

---

## Database Migrations (Alembic)

```bash
# Initialise Alembic (first time only)
alembic init alembic

# Generate a migration from model changes
alembic revision --autogenerate -m "initial"

# Apply migrations
alembic upgrade head
```

---

## Running Tests

```bash
pip install pytest pytest-asyncio httpx
pytest tests/ -v
```
