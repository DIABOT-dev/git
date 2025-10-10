-- DIABOT DB Migration (Viettel) - 000_init.sql
-- Generated: 2025-10-09T10:08:36.954202
-- Scope: Core MVP schema (Input + Rule-lite). No AI layer tables here.

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid()

-- =====================================================================
-- A) Core master table
-- =====================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT,
  dob DATE,
  gender TEXT,
  height_cm NUMERIC(5,2),
  chronic_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- =====================================================================
-- B) Input Layer (raw logs)
-- =====================================================================
CREATE TABLE IF NOT EXISTS bg_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  value NUMERIC(6,2) NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('mg/dL','mmol/L')),
  context TEXT,
  ts TIMESTAMPTZ NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bg_profile_ts ON bg_logs(profile_id, ts DESC);

CREATE TABLE IF NOT EXISTS bp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  systolic INT NOT NULL,
  diastolic INT NOT NULL,
  pulse INT,
  ts TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bp_profile_ts ON bp_logs(profile_id, ts DESC);

CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kg NUMERIC(5,2) NOT NULL,
  ts TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_weight_profile_ts ON weight_logs(profile_id, ts DESC);

CREATE TABLE IF NOT EXISTS water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ml INT NOT NULL CHECK (ml > 0),
  ts TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_water_profile_ts ON water_logs(profile_id, ts DESC);

CREATE TABLE IF NOT EXISTS meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  meal_type TEXT,               -- e.g. breakfast|lunch|dinner|snack
  text TEXT,                    -- free text description
  portion TEXT,                 -- optional portion descriptor
  ts TIMESTAMPTZ NOT NULL,
  photo_url TEXT,
  ai_tip_id UUID,               -- reserved for AI layer (no FK here)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_meal_profile_ts ON meal_logs(profile_id, ts DESC);

CREATE TABLE IF NOT EXISTS insulin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dose NUMERIC(6,2) NOT NULL,
  type TEXT CHECK (type IN ('rapid','basal') OR type IS NULL),
  context TEXT,
  ts TIMESTAMPTZ NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_insulin_profile_ts ON insulin_logs(profile_id, ts DESC);

-- =====================================================================
-- C) Feature flags (per profile)
-- =====================================================================
CREATE TABLE IF NOT EXISTS feature_flags (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  ai_agent_demo BOOLEAN NOT NULL DEFAULT TRUE,
  ai_factcheck_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ai_voice_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ml_meal_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  family_link_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ai_chat_model TEXT DEFAULT 'gpt-5',
  ai_budget_vnd INT NOT NULL DEFAULT 0,
  ai_token_cap INT NOT NULL DEFAULT 0,
  factcheck_daily_quota INT NOT NULL DEFAULT 0,
  chat_daily_quota INT NOT NULL DEFAULT 0,
  voice_minutes_quota INT NOT NULL DEFAULT 0,
  persona_switch_quota INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- D) Rule/OLAP-lite
-- =====================================================================
CREATE TABLE IF NOT EXISTS metrics_day (
  id BIGSERIAL PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  avg_bg NUMERIC(6,2),
  total_water INT,
  avg_weight NUMERIC(5,2),
  avg_bp_sys INT,
  avg_bp_dia INT,
  kcal_in INT,
  kcal_out INT,
  logs_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_metrics_day_profile_date ON metrics_day(profile_id, date);
CREATE INDEX IF NOT EXISTS idx_metrics_day_profile_date ON metrics_day(profile_id, date DESC);

-- =====================================================================
-- E) System/Audit
-- =====================================================================
CREATE TABLE IF NOT EXISTS logs_system (
  id BIGSERIAL PRIMARY KEY,
  source TEXT,
  level TEXT,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
