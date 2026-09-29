from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models import UserProfile
from app.schemas import MessageResponse, ProfileResponse, ProfileUpdate

router = APIRouter(prefix="/profile", tags=["Student Profile"])


@router.get("", response_model=ProfileResponse, summary="Get current user profile")
async def get_profile(current_user: UserProfile = Depends(get_current_user)):
    return current_user


@router.put("", response_model=ProfileResponse, summary="Update user profile")
async def update_profile(
    body: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user),
):
    update_data = body.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

    # mark profile complete if key fields are present
    if all(
        [
            current_user.full_name,
            current_user.degree,
            current_user.department,
            current_user.skills,
            current_user.career_goals,
        ]
    ):
        current_user.is_profile_complete = True

    db.add(current_user)
    return current_user


@router.delete("", response_model=MessageResponse, summary="Delete user profile")
async def delete_profile(
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user),
):
    await db.delete(current_user)
    return MessageResponse(message="Profile deleted successfully")
