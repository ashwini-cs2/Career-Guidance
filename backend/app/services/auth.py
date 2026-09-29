from __future__ import annotations

from fastapi import HTTPException, status
from supabase import Client, create_client

from app.config import get_settings

settings = get_settings()


def get_supabase_client() -> Client:
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


async def register_user(email: str, password: str, full_name: str) -> dict:
    client = get_supabase_client()
    try:
        response = client.auth.admin.create_user(
            {
                "email": email,
                "password": password,
                "user_metadata": {"full_name": full_name},
                "email_confirm": True,  # skip email verification in dev
            }
        )
        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user",
            )
        return {"user_id": response.user.id, "email": response.user.email}
    except Exception as exc:
        msg = str(exc)
        if "already registered" in msg.lower() or "already exists" in msg.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc


async def login_user(email: str, password: str) -> dict:
    client = get_supabase_client()
    try:
        response = client.auth.sign_in_with_password(
            {"email": email, "password": password}
        )
        if not response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        return {
            "access_token": response.session.access_token,
            "user_id": response.user.id,
            "email": response.user.email,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        ) from exc
