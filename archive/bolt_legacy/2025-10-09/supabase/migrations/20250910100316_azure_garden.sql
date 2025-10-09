/*
  # DIABOT V4 Core Schema

  1. New Tables
    - `profiles` - User profile information with health data
    - `glucose_logs` - Blood glucose measurements with context tags
    - `meal_logs` - Meal entries with nutritional information
    - `water_logs` - Water intake tracking with drink types
    - `insulin_logs` - Insulin dose tracking with types
    - `weight_logs` - Weight measurements over time
    - `bp_logs` - Blood pressure measurements
    - `metrics_day` - Daily aggregated metrics for charts
    - `metrics_week` - Weekly aggregated metrics for charts

  2. Types
    - Custom ENUMs for sex, goals, glucose tags, insulin types, drink kinds

  3. Security
    - Enable RLS on all user tables
    - Add policies for users to access only their own data
    - Service role has full access for ETL operations

  4. Indexes
    - Performance indexes on user_id and taken_at for all log tables
    - Composite indexes for metrics tables
*/

-- Create custom types
CREATE TYPE sex AS ENUM ('male', 'female', 'other');
CREATE TYPE goal AS ENUM ('lose_weight', 'build_muscle', 'stabilize_glucose');
CREATE TYPE glucose_tag AS ENUM ('fasting', 'before_meal', 'after_meal', 'bedtime', 'random');
CREATE TYPE insulin_type AS ENUM ('bolus', 'basal', 'mixed', 'correction');
CREATE TYPE drink_kind AS ENUM ('water', 'tea', 'coffee', 'milk', 'other');

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text,
  phone text,
  dob date,
  sex sex,
  height_cm int2,
  weight_kg numeric(5,2),
  waist_cm int2,
  goal goal,
  conditions jsonb DEFAULT '{}'::jsonb,
  prefs jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Glucose logs
CREATE TABLE IF NOT EXISTS glucose_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  value_mgdl int2 NOT NULL,
  tag glucose_tag,
  taken_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Meal logs
CREATE TABLE IF NOT EXISTS meal_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  carbs_g numeric(6,2),
  calories_kcal numeric(7,2),
  taken_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Water logs
CREATE TABLE IF NOT EXISTS water_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_ml int2 NOT NULL,
  kind drink_kind DEFAULT 'water',
  taken_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Insulin logs
CREATE TABLE IF NOT EXISTS insulin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dose_units numeric(5,2) NOT NULL,
  type insulin_type,
  taken_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Weight logs
CREATE TABLE IF NOT EXISTS weight_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  weight_kg numeric(5,2) NOT NULL,
  taken_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Blood pressure logs
CREATE TABLE IF NOT EXISTS bp_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  systolic int2 NOT NULL,
  diastolic int2 NOT NULL,
  pulse int2,
  taken_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Daily metrics
CREATE TABLE IF NOT EXISTS metrics_day (
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day date NOT NULL,
  metric text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, day, metric)
);

-- Weekly metrics
CREATE TABLE IF NOT EXISTS metrics_week (
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week int4 NOT NULL,
  metric text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, week, metric)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_glucose_logs_user_time ON glucose_logs (user_id, taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_time ON meal_logs (user_id, taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_water_logs_user_time ON water_logs (user_id, taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_insulin_logs_user_time ON insulin_logs (user_id, taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_time ON weight_logs (user_id, taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_bp_logs_user_time ON bp_logs (user_id, taken_at DESC);

-- Create partial unique indexes for nullable email/phone
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique ON profiles (email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique ON profiles (phone) WHERE phone IS NOT NULL;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE glucose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE insulin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_day ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_week ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role full access profiles"
  ON profiles
  FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for glucose_logs
CREATE POLICY "Users can read own glucose logs"
  ON glucose_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own glucose logs"
  ON glucose_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access glucose logs"
  ON glucose_logs
  FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for meal_logs
CREATE POLICY "Users can read own meal logs"
  ON meal_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal logs"
  ON meal_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access meal logs"
  ON meal_logs
  FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for water_logs
CREATE POLICY "Users can read own water logs"
  ON water_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own water logs"
  ON water_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access water logs"
  ON water_logs
  FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for insulin_logs
CREATE POLICY "Users can read own insulin logs"
  ON insulin_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insulin logs"
  ON insulin_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access insulin logs"
  ON insulin_logs
  FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for weight_logs
CREATE POLICY "Users can read own weight logs"
  ON weight_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight logs"
  ON weight_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access weight logs"
  ON weight_logs
  FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for bp_logs
CREATE POLICY "Users can read own bp logs"
  ON bp_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bp logs"
  ON bp_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access bp logs"
  ON bp_logs
  FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for metrics_day
CREATE POLICY "Users can read own daily metrics"
  ON metrics_day
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own daily metrics"
  ON metrics_day
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access daily metrics"
  ON metrics_day
  FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for metrics_week
CREATE POLICY "Users can read own weekly metrics"
  ON metrics_week
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own weekly metrics"
  ON metrics_week
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access weekly metrics"
  ON metrics_week
  FOR ALL
  TO service_role
  USING (true);