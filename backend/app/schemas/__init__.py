from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


# ═══════════════════════════════════════════════════════════════════════════════
# Auth schemas
# ═══════════════════════════════════════════════════════════════════════════════
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=255)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: str | None = None


class TokenPayload(BaseModel):
    sub: str  # user_id from Supabase


# ═══════════════════════════════════════════════════════════════════════════════
# Profile schemas
# ═══════════════════════════════════════════════════════════════════════════════
class ProfileUpdate(BaseModel):
    full_name: str | None = Field(None, max_length=255)
    degree: str | None = Field(None, max_length=100)
    department: str | None = Field(None, max_length=100)
    cgpa: float | None = Field(None, ge=0.0, le=10.0)
    skills: list[str] | None = None
    interests: list[str] | None = None
    career_goals: str | None = None
    years_of_experience: int | None = Field(None, ge=0)
    linkedin_url: str | None = None
    github_url: str | None = None


class ProfileResponse(BaseModel):
    id: str
    user_id: str
    email: str
    full_name: str | None
    degree: str | None
    department: str | None
    cgpa: float | None
    skills: list[str]
    interests: list[str]
    career_goals: str | None
    years_of_experience: int
    linkedin_url: str | None
    github_url: str | None
    is_profile_complete: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════════
# Career Recommendation schemas
# ═══════════════════════════════════════════════════════════════════════════════
class CareerRecommendationRequest(BaseModel):
    additional_context: str | None = Field(None, max_length=1000)


class SalaryInsight(BaseModel):
    role: str
    min_salary: str
    max_salary: str
    avg_salary: str
    currency: str = "USD"


class CareerRecommendationResponse(BaseModel):
    id: str
    user_id: str
    recommended_roles: list[str]
    required_skills: list[str]
    salary_insights: list[SalaryInsight] | dict
    career_roadmap: dict
    market_trends: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════════
# Resume Analysis schemas
# ═══════════════════════════════════════════════════════════════════════════════
class ResumeAnalysisResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    ats_score: float | None
    extracted_skills: list[str]
    missing_skills: list[str]
    improvement_suggestions: list[str]
    strengths: list[str]
    weaknesses: list[str]
    overall_feedback: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════════
# Skill Gap schemas
# ═══════════════════════════════════════════════════════════════════════════════
class SkillGapRequest(BaseModel):
    target_role: str = Field(min_length=2, max_length=255)
    additional_context: str | None = Field(None, max_length=500)


class LearningResource(BaseModel):
    title: str
    url: str | None = None
    type: str  # "course" | "book" | "tutorial" | "certification"
    platform: str | None = None
    duration: str | None = None


class SkillGapResponse(BaseModel):
    id: str
    user_id: str
    target_role: str
    current_skills: list[str]
    required_skills: list[str]
    missing_skills: list[str]
    matching_skills: list[str]
    gap_percentage: float | None
    learning_resources: list[dict]
    priority_skills: list[str]
    estimated_timeline: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════════
# Roadmap schemas
# ═══════════════════════════════════════════════════════════════════════════════
class RoadmapRequest(BaseModel):
    target_role: str = Field(min_length=2, max_length=255)
    duration_months: int = Field(default=6, ge=1, le=24)
    additional_context: str | None = Field(None, max_length=500)


class MonthlyPlan(BaseModel):
    month: int
    title: str
    skills: list[str]
    projects: list[str]
    resources: list[str]
    milestones: list[str]


class RoadmapResponse(BaseModel):
    id: str
    user_id: str
    target_role: str
    duration_months: int
    monthly_plan: list[dict]
    certifications: list[dict]
    projects: list[dict]
    total_skills_to_learn: int | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════════
# Chat schemas
# ═══════════════════════════════════════════════════════════════════════════════
class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    session_id: str | None = None


class ChatMessageOut(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatSessionOut(BaseModel):
    id: str
    title: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ChatSessionDetail(ChatSessionOut):
    messages: list[ChatMessageOut]


class ChatResponse(BaseModel):
    session_id: str
    message_id: str
    reply: str
    created_at: datetime


# ═══════════════════════════════════════════════════════════════════════════════
# Generic / utility
# ═══════════════════════════════════════════════════════════════════════════════
class MessageResponse(BaseModel):
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    detail: str
    code: str | None = None
