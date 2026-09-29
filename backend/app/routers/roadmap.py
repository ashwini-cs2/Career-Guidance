from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models import LearningRoadmap, UserProfile
from app.schemas import RoadmapRequest, RoadmapResponse
from app.services.gemini import generate_roadmap

router = APIRouter(prefix="/roadmap", tags=["Learning Roadmap"])


@router.post(
    "/generate",
    response_model=RoadmapResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate a month-wise learning roadmap",
)
async def generate(
    body: RoadmapRequest,
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user),
):
    profile_dict = {
        "skills": current_user.skills or [],
        "degree": current_user.degree,
        "department": current_user.department,
    }

    ai_data = await generate_roadmap(
        profile_dict,
        body.target_role,
        body.duration_months,
        body.additional_context or "",
    )

    roadmap = LearningRoadmap(
        user_id=current_user.user_id,
        target_role=body.target_role,
        duration_months=body.duration_months,
        monthly_plan=ai_data.get("monthly_plan", []),
        certifications=ai_data.get("certifications", []),
        projects=ai_data.get("projects", []),
        total_skills_to_learn=ai_data.get("total_skills_to_learn"),
        raw_response=str(ai_data),
    )
    db.add(roadmap)
    await db.flush()
    return roadmap


@router.get(
    "/roadmaps",
    response_model=list[RoadmapResponse],
    summary="List all roadmaps for current user",
)
async def list_roadmaps(
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user),
):
    result = await db.execute(
        select(LearningRoadmap)
        .where(LearningRoadmap.user_id == current_user.user_id)
        .order_by(LearningRoadmap.created_at.desc())
    )
    return result.scalars().all()


@router.get(
    "/roadmaps/{roadmap_id}",
    response_model=RoadmapResponse,
    summary="Get a specific roadmap",
)
async def get_roadmap(
    roadmap_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user),
):
    result = await db.execute(
        select(LearningRoadmap).where(
            LearningRoadmap.id == roadmap_id,
            LearningRoadmap.user_id == current_user.user_id,
        )
    )
    roadmap = result.scalar_one_or_none()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap


@router.delete("/roadmaps/{roadmap_id}", summary="Delete a roadmap")
async def delete_roadmap(
    roadmap_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user),
):
    result = await db.execute(
        select(LearningRoadmap).where(
            LearningRoadmap.id == roadmap_id,
            LearningRoadmap.user_id == current_user.user_id,
        )
    )
    roadmap = result.scalar_one_or_none()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    await db.delete(roadmap)
    return {"message": "Roadmap deleted", "success": True}
