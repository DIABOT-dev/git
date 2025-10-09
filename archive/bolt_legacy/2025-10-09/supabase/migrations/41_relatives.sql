/*
  # FamilyLink - Relatives Table

  1. New Tables
    - `relatives` - Family member relationships
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Account owner (references profiles)
      - `relative_id` (uuid) - Family member (references profiles)
      - `relation_type` (enum) - Relationship type
      - `role` (enum) - Permission level (viewer or editor)
      - `created_at` (timestamptz)
      - UNIQUE constraint on (user_id, relative_id)

  2. Custom Types
    - relation_type: father, mother, son, daughter, spouse, sibling, other
    - relative_role: viewer (read-only), editor (can log on behalf)

  3. Security (RLS)
    - Account owner (user_id) can read/create/delete links
    - Relative (relative_id) can read their link
    - Relative with 'editor' role can insert logs on behalf of user_id
    - Relative with 'viewer' role can only read user_id's data
    - No cross-user data access without explicit link

  4. Notes
    - Feature flag RELATIVE_ENABLED must be ON for API access
    - When OFF: UI hidden, API returns 404
    - Logging on behalf uses stored procedure to preserve audit trail
    - Emergency Mode (24h alert) uses this table for contacts
*/

-- Create custom types for relatives
DO $$ BEGIN
  CREATE TYPE relation_type AS ENUM (
    'father',
    'mother',
    'son',
    'daughter',
    'spouse',
    'sibling',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE relative_role AS ENUM (
    'viewer',
    'editor'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create relatives table
CREATE TABLE IF NOT EXISTS public.relatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  relative_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  relation_type relation_type NOT NULL,
  role relative_role NOT NULL DEFAULT 'viewer',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, relative_id),
  -- Prevent self-linking
  CONSTRAINT no_self_link CHECK (user_id != relative_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_relatives_user ON relatives (user_id);
CREATE INDEX IF NOT EXISTS idx_relatives_relative ON relatives (relative_id);
CREATE INDEX IF NOT EXISTS idx_relatives_user_role ON relatives (user_id, role);

-- Enable RLS
ALTER TABLE relatives ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Account owner can read their links
CREATE POLICY "Owner can read own relative links"
  ON relatives
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Relative can read links where they are the relative
CREATE POLICY "Relative can read links about them"
  ON relatives
  FOR SELECT
  TO authenticated
  USING (auth.uid() = relative_id);

-- RLS Policy: Account owner can create links
CREATE POLICY "Owner can create relative links"
  ON relatives
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Account owner can delete links
CREATE POLICY "Owner can delete relative links"
  ON relatives
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Service role full access
CREATE POLICY "Service role full access relatives"
  ON relatives
  FOR ALL
  TO service_role
  USING (true);

-- Helper function: Check if user A can access user B's data
CREATE OR REPLACE FUNCTION can_access_user_data(
  accessor_id uuid,
  target_user_id uuid
)
RETURNS boolean AS $$
BEGIN
  -- User can always access their own data
  IF accessor_id = target_user_id THEN
    RETURN true;
  END IF;

  -- Check if there's a valid relative link
  RETURN EXISTS (
    SELECT 1 FROM relatives
    WHERE user_id = target_user_id
      AND relative_id = accessor_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if user has editor role for target
CREATE OR REPLACE FUNCTION has_editor_role(
  accessor_id uuid,
  target_user_id uuid
)
RETURNS boolean AS $$
BEGIN
  -- User is always editor for their own data
  IF accessor_id = target_user_id THEN
    RETURN true;
  END IF;

  -- Check if relative has editor role
  RETURN EXISTS (
    SELECT 1 FROM relatives
    WHERE user_id = target_user_id
      AND relative_id = accessor_id
      AND role = 'editor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for log tables to support relatives (viewer role)
-- These policies allow relatives to SELECT logs if they have viewer or editor role

-- Glucose logs: relatives can view
CREATE POLICY "Relatives can view glucose logs"
  ON glucose_logs
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR can_access_user_data(auth.uid(), user_id)
  );

-- Meal logs: relatives can view
CREATE POLICY "Relatives can view meal logs"
  ON meal_logs
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR can_access_user_data(auth.uid(), user_id)
  );

-- Water logs: relatives can view
CREATE POLICY "Relatives can view water logs"
  ON water_logs
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR can_access_user_data(auth.uid(), user_id)
  );

-- Insulin logs: relatives can view
CREATE POLICY "Relatives can view insulin logs"
  ON insulin_logs
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR can_access_user_data(auth.uid(), user_id)
  );

-- Weight logs: relatives can view
CREATE POLICY "Relatives can view weight logs"
  ON weight_logs
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR can_access_user_data(auth.uid(), user_id)
  );

-- BP logs: relatives can view
CREATE POLICY "Relatives can view bp logs"
  ON bp_logs
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR can_access_user_data(auth.uid(), user_id)
  );

-- Note: INSERT policies for editors will be handled via stored procedures
-- to maintain audit trail and prevent direct manipulation
