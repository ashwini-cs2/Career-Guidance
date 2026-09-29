from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models import UserProfile
from app.schemas import AuthResponse, LoginRequest, MessageResponse, ProfileResponse, RegisterRequest
from app.services.auth import login_user, register_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Create a Supabase Auth user and a matching local profile row."""
    result = await register_user(body.email, body.password, body.full_name)

    # create local profile
    profile = UserProfile(
        user_id=result["user_id"],
        email=result["email"],
        full_name=body.full_name,
    )
    db.add(profile)
    await db.flush()

    # sign in immediately so the caller gets a token
    tokens = await login_user(body.email, body.password)

    return AuthResponse(
        access_token=tokens["access_token"],
        user_id=result["user_id"],
        email=result["email"],
        full_name=body.full_name,
    )


@router.post("/login", response_model=AuthResponse, summary="Login with email & password")
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    tokens = await login_user(body.email, body.password)

    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == tokens["user_id"])
    )
    profile = result.scalar_one_or_none()

    return AuthResponse(
        access_token=tokens["access_token"],
        user_id=tokens["user_id"],
        email=tokens["email"],
        full_name=profile.full_name if profile else None,
    )


@router.get("/me", response_model=ProfileResponse, summary="Get current authenticated user")
async def me(current_user: UserProfile = Depends(get_current_user)):
    return current_user
