/*
  # Proactive Nudge System - Event Tracking

  1. New Tables
    - `nudge_events` - Meta-only tracking (no PII)
      - `id` (uuid, primary key)
      - `profile_id` (uuid) - User reference (for RLS, not logged in events)
      - `nudge_type` (enum) - Type of nudge
      - `action` (enum) - User action (shown, clicked, dismissed)
      - `request_id` (text) - Correlation ID for debugging
      - `created_at` (timestamptz) - Event timestamp

  2. Custom Types
    - nudge_type: missing_log, post_meal_walk, water_reminder, bg_check
    - nudge_action: shown, clicked, dismissed, applied

  3. Security (RLS)
    - Users can only read their own events
    - Service role can read all for analytics
    - Events contain NO PII (no message content, no user data)

  4. Metrics
    - Apply rate = (clicked + applied) / shown
    - Target: >= 30% apply rate
    - Dismiss rate monitoring for UX improvement

  5. Notes
    - Feature flag NUDGE_ENABLED must be ON for system to work
    - When OFF: no events logged, API returns 404
    - Time windows enforced: 06:00-21:00 (daytime)
    - Night mode (21:00-06:00) requires explicit opt-in
*/

-- Create custom types for nudges
DO $$ BEGIN
  CREATE TYPE nudge_type AS ENUM (
    'missing_log',
    'post_meal_walk',
    'water_reminder',
    'bg_check'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE nudge_action AS ENUM (
    'shown',
    'clicked',
    'dismissed',
    'applied'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create nudge_events table
CREATE TABLE IF NOT EXISTS public.nudge_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nudge_type nudge_type NOT NULL,
  action nudge_action NOT NULL,
  request_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance and analytics
CREATE INDEX IF NOT EXISTS idx_nudge_events_profile ON nudge_events (profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nudge_events_type ON nudge_events (nudge_type, action);
CREATE INDEX IF NOT EXISTS idx_nudge_events_created ON nudge_events (created_at DESC);

-- Enable RLS
ALTER TABLE nudge_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own events
CREATE POLICY "Users can read own nudge events"
  ON nudge_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

-- RLS Policy: Users can insert their own events
CREATE POLICY "Users can insert own nudge events"
  ON nudge_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

-- RLS Policy: Service role full access for analytics
CREATE POLICY "Service role full access nudge events"
  ON nudge_events
  FOR ALL
  TO service_role
  USING (true);

-- Helper function: Calculate apply rate for user
CREATE OR REPLACE FUNCTION get_user_nudge_apply_rate(
  target_user_id uuid,
  days_back int DEFAULT 7
)
RETURNS numeric AS $$
DECLARE
  shown_count int;
  applied_count int;
BEGIN
  -- Count shown events
  SELECT COUNT(*) INTO shown_count
  FROM nudge_events
  WHERE profile_id = target_user_id
    AND action = 'shown'
    AND created_at >= now() - (days_back || ' days')::interval;

  -- If no nudges shown, return 0
  IF shown_count = 0 THEN
    RETURN 0;
  END IF;

  -- Count applied/clicked events
  SELECT COUNT(*) INTO applied_count
  FROM nudge_events
  WHERE profile_id = target_user_id
    AND action IN ('clicked', 'applied')
    AND created_at >= now() - (days_back || ' days')::interval;

  -- Return percentage
  RETURN ROUND((applied_count::numeric / shown_count::numeric) * 100, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Get nudge stats for user
CREATE OR REPLACE FUNCTION get_user_nudge_stats(
  target_user_id uuid,
  days_back int DEFAULT 7
)
RETURNS TABLE (
  nudge_type nudge_type,
  shown_count bigint,
  clicked_count bigint,
  dismissed_count bigint,
  applied_count bigint,
  apply_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ne.nudge_type,
    COUNT(*) FILTER (WHERE ne.action = 'shown') AS shown_count,
    COUNT(*) FILTER (WHERE ne.action = 'clicked') AS clicked_count,
    COUNT(*) FILTER (WHERE ne.action = 'dismissed') AS dismissed_count,
    COUNT(*) FILTER (WHERE ne.action = 'applied') AS applied_count,
    CASE
      WHEN COUNT(*) FILTER (WHERE ne.action = 'shown') = 0 THEN 0
      ELSE ROUND(
        (COUNT(*) FILTER (WHERE ne.action IN ('clicked', 'applied'))::numeric /
         COUNT(*) FILTER (WHERE ne.action = 'shown')::numeric) * 100,
        2
      )
    END AS apply_rate
  FROM nudge_events ne
  WHERE ne.profile_id = target_user_id
    AND ne.created_at >= now() - (days_back || ' days')::interval
  GROUP BY ne.nudge_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
