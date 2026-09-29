from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models import CareerRecommendation, UserProfile
from app.schemas import CareerRecommendationRequest, CareerRecommendationResponse
from app.services.gemini import get_career_recommendations

router = APIRouter(prefix="/career", tags=["Career Recommendations"])


@router.post(
    "/recommend",
    response_model=CareerRecommendationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate AI career recommendations",
)
async def recommend(
    body: CareerRecommendationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user),
):
    if not current_user.skills and not current_user.degree:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please complete your profile with at least your degree and skills before generating recommendations.",
        )

    profile_dict = {
        "full_name": current_user.full_name,
        "degree": current_user.degree,
        "department": current_user.department,
        "cgpa": current_user.cgpa,
        "skills": current_user.skills or [],
        "interests": current_user.interests or [],
        "career_goals": current_user.career_goals,
        "years_of_experience": current_user.years_of_experience,
    }

    ai_data = await get_career_recommendations(
        profile_dict, body.additional_context or ""
    )

    rec = CareerRecommendation(
        user_id=current_user.user_id,
        recommended_roles=ai_data.get("recommended_roles", []),
        required_skills=ai_data.get("required_skills", []),
        salary_insights=ai_data.get("salary_insights", {}),
        career_roadmap=ai_data.get("career_roadmap", {}),
        market_trends=ai_data.get("market_trends", []),
        raw_response=str(ai_data),
    )
    db.add(rec)
    await db.flush()
    return rec


@router.get(
    "/recommendations",
    response_model=list[CareerRecommendationResponse],
    summary="List all career recommendations for current user",
)
async def list_recommendations(
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user),
):
    result = await db.execute(
        select(CareerRecommendation)
        .where(CareerRecommendation.user_id == current_user.user_id)
        .order_by(CareerRecommendation.created_at.desc())
    )
    return result.scalars().all()


@router.get(
    "/recommendations/{rec_id}",
    response_model=CareerRecommendationResponse,
    summary="Get a specific career recommendation",
)
async def get_recommendation(
    rec_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user),
):
    result = await db.execute(
        select(CareerRecommendation).where(
            CareerRecommendation.id == rec_id,
            CareerRecommendation.user_id == current_user.user_id,
        )
    )
    rec = result.scalar_one_or_none()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return rec
