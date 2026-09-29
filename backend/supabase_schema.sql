-- ============================================================
-- AI Career Advisor — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── user_profiles ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID UNIQUE NOT NULL,          -- references auth.users(id)
    email           TEXT UNIQUE NOT NULL,
    full_name       TEXT,
    degree          TEXT,
    department      TEXT,
    cgpa            NUMERIC(4, 2) CHECK (cgpa >= 0 AND cgpa <= 10),
    skills          JSONB NOT NULL DEFAULT '[]',
    interests       JSONB NOT NULL DEFAULT '[]',
    career_goals    TEXT,
    years_of_experience INTEGER NOT NULL DEFAULT 0,
    linkedin_url    TEXT,
    github_url      TEXT,
    is_profile_complete BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── career_recommendations ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS career_recommendations (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    recommended_roles   JSONB NOT NULL DEFAULT '[]',
    required_skills     JSONB NOT NULL DEFAULT '[]',
    salary_insights     JSONB NOT NULL DEFAULT '{}',
    career_roadmap      JSONB NOT NULL DEFAULT '{}',
    market_trends       JSONB NOT NULL DEFAULT '[]',
    raw_response        TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── resume_analyses ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resume_analyses (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    filename                TEXT NOT NULL,
    ats_score               NUMERIC(5, 2),
    extracted_skills        JSONB NOT NULL DEFAULT '[]',
    missing_skills          JSONB NOT NULL DEFAULT '[]',
    improvement_suggestions JSONB NOT NULL DEFAULT '[]',
    strengths               JSONB NOT NULL DEFAULT '[]',
    weaknesses              JSONB NOT NULL DEFAULT '[]',
    overall_feedback        TEXT,
    raw_response            TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── skill_gap_analyses ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skill_gap_analyses (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    target_role         TEXT NOT NULL,
    current_skills      JSONB NOT NULL DEFAULT '[]',
    required_skills     JSONB NOT NULL DEFAULT '[]',
    missing_skills      JSONB NOT NULL DEFAULT '[]',
    matching_skills     JSONB NOT NULL DEFAULT '[]',
    gap_percentage      NUMERIC(5, 2),
    learning_resources  JSONB NOT NULL DEFAULT '[]',
    priority_skills     JSONB NOT NULL DEFAULT '[]',
    estimated_timeline  TEXT,
    raw_response        TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── learning_roadmaps ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS learning_roadmaps (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    target_role             TEXT NOT NULL,
    duration_months         INTEGER NOT NULL DEFAULT 6,
    monthly_plan            JSONB NOT NULL DEFAULT '[]',
    certifications          JSONB NOT NULL DEFAULT '[]',
    projects                JSONB NOT NULL DEFAULT '[]',
    total_skills_to_learn   INTEGER,
    raw_response            TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── chat_sessions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    title       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── chat_messages ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id  UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content     TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id      ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_career_recs_user_id        ON career_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user_id    ON resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_gap_user_id          ON skill_gap_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id           ON learning_roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id      ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id   ON chat_messages(session_id);

-- ── Auto-update updated_at trigger ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Row-Level Security (RLS) ──────────────────────────────────────────────────
-- Enable RLS on all tables
ALTER TABLE user_profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_analyses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_gap_analyses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_roadmaps      ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages          ENABLE ROW LEVEL SECURITY;

-- Policies: service_role bypasses RLS (used by the backend)
-- Authenticated users can only access their own data
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own recommendations"
    ON career_recommendations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own resume analyses"
    ON resume_analyses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own skill gap analyses"
    ON skill_gap_analyses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own roadmaps"
    ON learning_roadmaps FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own chat sessions"
    ON chat_sessions FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own chat messages"
    ON chat_messages FOR ALL
    USING (
        session_id IN (
            SELECT id FROM chat_sessions WHERE user_id = auth.uid()
        )
    );
