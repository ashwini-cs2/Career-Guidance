from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models import SkillGapAnalysis, UserProfile
from app.schemas import SkillGapRequest, SkillGapResponse
from app.services.gemini import analyze_skill_gap

router = APIRouter(prefix="/skills", tags=["Skill Gap Analysis"])


@router.post(
    "/gap-analysis",
    response_model=SkillGapResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Run skill gap analysis against a target role",
)
async def run_gap_analysis(
    body: SkillGapRequest,
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user),
):
    profile_dict = {
        "skills": current_user.skills or [],
        "department": current_user.department,
        "years_of_experience": current_user.years_of_experience,
    }

    ai_data = await analyze_skill_gap(
        profile_dict, body.target_role, body.additional_context or ""
    )

    gap = SkillGapAnalysis(
        user_id=current_user.user_id,
        target_role=body.target_role,
        current_skills=current_user.skills or [],
        required_skills=ai_data.get("required_skills", []),
        missing_skills=ai_data.get("missing_skills", []),
        matching_skills=ai_data.get("matching_skills", []),
        gap_percentage=ai_data.get("gap_percentage"),
        learning_resources=ai_data.get("learning_resources", []),
        priority_skills=ai_data.get("priority_skills", []),
        estimated_timeline=ai_data.get("estimated_timeline"),
        raw_response=str(ai_data),
    )
    db.add(gap)
    await db.flush()
    return gap


@router.get(
    "/gap-analyses",
    response_model=list[SkillGapResponse],
    summary="List skill gap analyses",
)
async def list_analyses(
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user),
):
    result = await db.execute(
        select(SkillGapAnalysis)
        .where(SkillGapAnalysis.user_id == current_user.user_id)
        .order_by(SkillGapAnalysis.created_at.desc())
    )
    return result.scalars().all()


@router.get(
    "/gap-analyses/{analysis_id}",
    response_model=SkillGapResponse,
    summary="Get a specific skill gap analysis",
)
async def get_analysis(
    analysis_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user),
):
    result = await db.execute(
        select(SkillGapAnalysis).where(
            SkillGapAnalysis.id == analysis_id,
            SkillGapAnalysis.user_id == current_user.user_id,
        )
    )
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis
