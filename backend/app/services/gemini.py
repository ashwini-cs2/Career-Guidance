"""Thin async wrapper around the Google Generative AI SDK."""
from __future__ import annotations

import json
import re

import google.generativeai as genai
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import get_settings

settings = get_settings()
genai.configure(api_key=settings.gemini_api_key)

_model = genai.GenerativeModel(settings.gemini_model)


def _extract_json(text: str) -> dict | list:
    """Strip markdown fences and parse JSON from Gemini output."""
    clean = re.sub(r"```(?:json)?", "", text).replace("```", "").strip()
    return json.loads(clean)


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
async def generate(prompt: str, *, json_output: bool = False) -> str:
    response = await _model.generate_content_async(prompt)
    return response.text


async def generate_json(prompt: str) -> dict | list:
    text = await generate(prompt + "\n\nRespond ONLY with valid JSON. No markdown, no explanation.")
    return _extract_json(text)


# ── Domain helpers ────────────────────────────────────────────────────────────

async def get_career_recommendations(profile: dict, extra: str = "") -> dict:
    prompt = f"""
You are an expert career advisor. Analyze the student profile and generate detailed career recommendations.

Profile:
- Name: {profile.get('full_name', 'Student')}
- Degree: {profile.get('degree', 'N/A')}
- Department: {profile.get('department', 'N/A')}
- CGPA: {profile.get('cgpa', 'N/A')}
- Current Skills: {', '.join(profile.get('skills', []) or [])}
- Interests: {', '.join(profile.get('interests', []) or [])}
- Career Goals: {profile.get('career_goals', 'N/A')}
- Years of Experience: {profile.get('years_of_experience', 0)}
{f'- Additional Context: {extra}' if extra else ''}

Return a JSON object with:
{{
  "recommended_roles": ["role1", "role2", "role3", "role4", "role5"],
  "required_skills": ["skill1", "skill2", ...],
  "salary_insights": [
    {{"role": "...", "min_salary": "$X", "max_salary": "$Y", "avg_salary": "$Z", "currency": "USD"}}
  ],
  "career_roadmap": {{
    "short_term": ["action1", ...],
    "mid_term": ["action1", ...],
    "long_term": ["action1", ...]
  }},
  "market_trends": ["trend1", "trend2", ...]
}}
"""
    return await generate_json(prompt)


async def analyze_resume(text: str, profile: dict) -> dict:
    prompt = f"""
You are an expert ATS resume reviewer and career consultant.

Resume Text:
{text[:6000]}

Candidate Profile:
- Degree: {profile.get('degree', 'N/A')}
- Department: {profile.get('department', 'N/A')}
- Target Goals: {profile.get('career_goals', 'N/A')}

Perform a thorough ATS analysis and return a JSON object:
{{
  "ats_score": <float 0-100>,
  "extracted_skills": ["skill1", ...],
  "missing_skills": ["skill1", ...],
  "improvement_suggestions": ["suggestion1", ...],
  "strengths": ["strength1", ...],
  "weaknesses": ["weakness1", ...],
  "overall_feedback": "<2-3 sentence summary>"
}}

Be specific. ATS score should reflect keyword density, formatting, and relevance.
"""
    return await generate_json(prompt)


async def analyze_skill_gap(profile: dict, target_role: str, extra: str = "") -> dict:
    current_skills = profile.get("skills", []) or []
    prompt = f"""
You are a technical skills expert. Perform a skill gap analysis.

Target Role: {target_role}
Current Skills: {', '.join(current_skills)}
Department: {profile.get('department', 'N/A')}
Experience: {profile.get('years_of_experience', 0)} years
{f'Context: {extra}' if extra else ''}

Return a JSON object:
{{
  "required_skills": ["skill1", ...],
  "missing_skills": ["skill1", ...],
  "matching_skills": ["skill1", ...],
  "gap_percentage": <float 0-100>,
  "priority_skills": ["most urgent skill1", ...],
  "estimated_timeline": "X months",
  "learning_resources": [
    {{"title": "...", "type": "course|book|tutorial|certification", "platform": "...", "url": "...", "duration": "..."}}
  ]
}}
"""
    return await generate_json(prompt)


async def generate_roadmap(profile: dict, target_role: str, months: int, extra: str = "") -> dict:
    prompt = f"""
You are a senior tech mentor creating a detailed, month-by-month learning roadmap.

Target Role: {target_role}
Duration: {months} months
Current Skills: {', '.join(profile.get('skills', []) or [])}
Background: {profile.get('degree', 'N/A')} in {profile.get('department', 'N/A')}
{f'Context: {extra}' if extra else ''}

Return a JSON object:
{{
  "monthly_plan": [
    {{
      "month": 1,
      "title": "Foundation",
      "skills": ["skill1", ...],
      "projects": ["project idea 1", ...],
      "resources": ["resource1", ...],
      "milestones": ["milestone1", ...]
    }}
    // ... one entry per month up to {months}
  ],
  "certifications": [
    {{"name": "...", "provider": "...", "url": "...", "estimated_time": "..."}}
  ],
  "projects": [
    {{"name": "...", "description": "...", "skills_used": ["..."], "complexity": "beginner|intermediate|advanced"}}
  ],
  "total_skills_to_learn": <int>
}}
"""
    return await generate_json(prompt)


async def chat_with_advisor(
    user_message: str,
    history: list[dict],
    profile: dict,
) -> str:
    system = f"""You are an expert AI Career Advisor. You help students and professionals with:
- Career planning and exploration
- Skill development advice
- Resume and interview tips
- Job market insights
- Learning resource recommendations

User Profile Context:
- Name: {profile.get('full_name', 'User')}
- Degree: {profile.get('degree', 'N/A')} in {profile.get('department', 'N/A')}
- Skills: {', '.join(profile.get('skills', []) or [])}
- Career Goals: {profile.get('career_goals', 'N/A')}

Be concise, practical, and encouraging. Use bullet points when listing items."""

    # Build conversation history for context
    history_text = ""
    for msg in history[-10:]:  # last 10 messages for context window
        role = "User" if msg["role"] == "user" else "Advisor"
        history_text += f"{role}: {msg['content']}\n"

    prompt = f"""{system}

Conversation History:
{history_text}
User: {user_message}
Advisor:"""

    return await generate(prompt)
