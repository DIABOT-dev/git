/*
  # Feature Flags System

  1. New Tables
    - `feature_flags` - Runtime feature flag configuration
      - `key` (text, primary key) - Flag identifier
      - `value` (text) - Flag value (boolean string or enum)
      - `description` (text) - Human-readable description
      - `updated_at` (timestamptz) - Last modification timestamp

  2. Seed Data
    - RELATIVE_ENABLED (default: false) - FamilyLink module
    - NUDGE_ENABLED (default: false) - Proactive Nudge system
    - SAFETY_RULES_ENABLED (default: false) - Enhanced safety rules

  3. Security
    - Enable RLS on feature_flags
    - Authenticated users can read flags
    - Only service_role can modify flags
    - Admin API endpoint for runtime toggling

  4. Notes
    - Flags are cached for 60 seconds in application layer
    - Environment variables take precedence over DB flags
    - When flag is OFF: UI hidden, API returns 404
*/

-- Create feature_flags table
CREATE TABLE IF NOT EXISTS public.feature_flags (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT 'false',
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_feature_flags_updated ON feature_flags (updated_at DESC);

-- Enable RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies: authenticated users can read, only service_role can write
CREATE POLICY "Authenticated users can read flags"
  ON feature_flags
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage flags"
  ON feature_flags
  FOR ALL
  TO service_role
  USING (true);

-- Seed initial feature flags (all OFF by default for QA Freeze 0.9.0)
INSERT INTO feature_flags (key, value, description, updated_at)
VALUES
  ('RELATIVE_ENABLED', 'false', 'FamilyLink - Allow relatives to view/log on behalf', now()),
  ('NUDGE_ENABLED', 'false', 'Proactive Nudge - Context-aware reminders', now()),
  ('SAFETY_RULES_ENABLED', 'false', 'Enhanced safety rules and validation', now())
ON CONFLICT (key) DO NOTHING;

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_feature_flag_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_feature_flags_updated ON feature_flags;
CREATE TRIGGER trg_feature_flags_updated
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_feature_flag_timestamp();
