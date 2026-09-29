from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models import ResumeAnalysis, UserProfile
from app.schemas import ResumeAnalysisResponse
from app.services.gemini import analyze_resume
from app.utils.pdf import extract_text_from_pdf

settings = get_settings()
router = APIRouter(prefix="/resume", tags=["Resume Analyzer"])

_ALLOWED_TYPES = {"application/pdf", "application/x-pdf"}


@router.post(
    "/analyze",
    response_model=ResumeAnalysisResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and analyze a resume PDF",
)
async def analyze(
    file: UploadFile = File(..., description="PDF resume file"),
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user),
):
    # Validate content type
    if file.content_type not in _ALLOWED_TYPES and not (
        file.filename or ""
    ).lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only PDF files are accepted",
        )

    file_bytes = await file.read()
    if len(file_bytes) > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum size of {settings.max_file_size_mb} MB",
        )

    # Extract text
    try:
        resume_text = extract_text_from_pdf(file_bytes)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not extract text from PDF: {exc}",
        ) from exc

    if not resume_text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No readable text found in the PDF. Please upload a text-based (not scanned) resume.",
        )

    profile_dict = {
        "degree": current_user.degree,
        "department": current_user.department,
        "career_goals": current_user.career_goals,
    }

    ai_data = await analyze_resume(resume_text, profile_dict)

    analysis = ResumeAnalysis(
        user_id=current_user.user_id,
        filename=file.filename or "resume.pdf",
        ats_score=ai_data.get("ats_score"),
        extracted_skills=ai_data.get("extracted_skills", []),
        missing_skills=ai_data.get("missing_skills", []),
        improvement_suggestions=ai_data.get("improvement_suggestions", []),
        strengths=ai_data.get("strengths", []),
        weaknesses=ai_data.get("weaknesses", []),
        overall_feedback=ai_data.get("overall_feedback"),
        raw_response=str(ai_data),
    )
    db.add(analysis)
    await db.flush()
    return analysis


@router.get(
    "/analyses",
    response_model=list[ResumeAnalysisResponse],
    summary="List all resume analyses for current user",
)
async def list_analyses(
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user),
):
    result = await db.execute(
        select(ResumeAnalysis)
        .where(ResumeAnalysis.user_id == current_user.user_id)
        .order_by(ResumeAnalysis.created_at.desc())
    )
    return result.scalars().all()


@router.get(
    "/analyses/{analysis_id}",
    response_model=ResumeAnalysisResponse,
    summary="Get a specific resume analysis",
)
async def get_analysis(
    analysis_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user),
):
    result = await db.execute(
        select(ResumeAnalysis).where(
            ResumeAnalysis.id == analysis_id,
            ResumeAnalysis.user_id == current_user.user_id,
        )
    )
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(status_code=404, detail="Resume analysis not found")
    return analysis
