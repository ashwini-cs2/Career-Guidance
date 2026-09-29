from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.database import engine
from app.models import Base  # noqa: F401 – ensures all models are registered
from app.routers import auth, career, chat, profile, resume, roadmap, skills

settings = get_settings()


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (use Alembic for production migrations)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


# ── App factory ───────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="""
## AI-Powered Career Advisor API

A comprehensive FastAPI backend that powers personalised career guidance using **Google Gemini 2.5 Flash**.

### Features
- 🔐 **Authentication** — Supabase JWT-based auth
- 👤 **Student Profile** — Manage degree, skills, interests & goals
- 🎯 **Career Recommendations** — AI-generated role suggestions with salary insights
- 📄 **Resume Analyzer** — ATS scoring, skill extraction, improvement tips
- 🔍 **Skill Gap Analysis** — Compare current vs required skills for any role
- 🗺️ **Learning Roadmap** — Month-by-month plan with projects & certifications
- 💬 **AI Career Chatbot** — Context-aware conversation with full history
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global exception handlers ─────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )


# ── Routers ───────────────────────────────────────────────────────────────────
PREFIX = "/api/v1"

app.include_router(auth.router, prefix=PREFIX)
app.include_router(profile.router, prefix=PREFIX)
app.include_router(career.router, prefix=PREFIX)
app.include_router(resume.router, prefix=PREFIX)
app.include_router(skills.router, prefix=PREFIX)
app.include_router(roadmap.router, prefix=PREFIX)
app.include_router(chat.router, prefix=PREFIX)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"], summary="Health check")
async def health():
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
    }


@app.get("/", tags=["Root"], include_in_schema=False)
async def root():
    return {"message": f"Welcome to {settings.app_name} API", "docs": "/docs"}
