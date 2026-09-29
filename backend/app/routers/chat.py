from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models import ChatMessage, ChatSession, UserProfile
from app.schemas import (
    ChatRequest,
    ChatResponse,
    ChatSessionDetail,
    ChatSessionOut,
    MessageResponse,
)
from app.services.gemini import chat_with_advisor

router = APIRouter(prefix="/chat", tags=["AI Career Chatbot"])


@router.post(
    "/message",
    response_model=ChatResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Send a message to the AI career advisor",
)
async def send_message(
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user),
):
    # Resolve or create session
    if body.session_id:
        result = await db.execute(
            select(ChatSession).where(
                ChatSession.id == body.session_id,
                ChatSession.user_id == current_user.user_id,
            )
        )
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")
    else:
        # Auto-create a new session with title from first message
        title = body.message[:60] + ("…" if len(body.message) > 60 else "")
        session = ChatSession(user_id=current_user.user_id, title=title)
        db.add(session)
        await db.flush()

    # Load recent history (last 20 messages)
    hist_result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session.id)
        .order_by(ChatMessage.created_at.desc())
        .limit(20)
    )
    history = [
        {"role": m.role, "content": m.content}
        for m in reversed(hist_result.scalars().all())
    ]

    profile_dict = {
        "full_name": current_user.full_name,
        "degree": current_user.degree,
        "department": current_user.department,
        "skills": current_user.skills or [],
        "career_goals": current_user.career_goals,
    }

    # Get AI reply
    reply_text = await chat_with_advisor(body.message, history, profile_dict)

    # Persist user message + assistant reply
    user_msg = ChatMessage(
        session_id=session.id, role="user", content=body.message
    )
    assistant_msg = ChatMessage(
        session_id=session.id, role="assistant", content=reply_text
    )
    db.add(user_msg)
    db.add(assistant_msg)
    await db.flush()

    return ChatResponse(
        session_id=session.id,
        message_id=assistant_msg.id,
        reply=reply_text,
        created_at=assistant_msg.created_at,
    )


@router.get(
    "/sessions",
    response_model=list[ChatSessionOut],
    summary="List all chat sessions",
)
async def list_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user),
):
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == current_user.user_id)
        .order_by(ChatSession.updated_at.desc())
    )
    return result.scalars().all()


@router.get(
    "/sessions/{session_id}",
    response_model=ChatSessionDetail,
    summary="Get chat session with message history",
)
async def get_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user),
):
    result = await db.execute(
        select(ChatSession)
        .where(
            ChatSession.id == session_id,
            ChatSession.user_id == current_user.user_id,
        )
        .options(selectinload(ChatSession.messages))
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.delete(
    "/sessions/{session_id}",
    response_model=MessageResponse,
    summary="Delete a chat session and its messages",
)
async def delete_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user),
):
    result = await db.execute(
        select(ChatSession).where(
            ChatSession.id == session_id,
            ChatSession.user_id == current_user.user_id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    await db.delete(session)
    return MessageResponse(message="Session deleted successfully")
