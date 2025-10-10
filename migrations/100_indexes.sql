BEGIN;
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  user_id UUID,
  name TEXT,
  dob DATE,
  gender TEXT,
  height_cm INTEGER,
  chronic_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bg_logs (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  value NUMERIC(6,2),
  unit TEXT,
  context TEXT,
  ts TIMESTAMPTZ,
  note TEXT
);

CREATE INDEX IF NOT EXISTS idx_bg_logs_profile_ts ON bg_logs(profile_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_bg_logs_profile ON bg_logs(profile_id);
COMMIT;
