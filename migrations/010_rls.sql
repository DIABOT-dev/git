-- 010_rls.sql
CREATE OR REPLACE FUNCTION diabot_set_user(uid UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM set_config('diabot.user_id', uid::text, TRUE);
END;
$$;

ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE bg_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE bp_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE insulin_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_day   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS p_profiles_select ON profiles;
CREATE POLICY p_profiles_select ON profiles
  FOR SELECT USING (user_id::text = current_setting('diabot.user_id', true));

DROP POLICY IF EXISTS p_profiles_mod ON profiles;
CREATE POLICY p_profiles_mod ON profiles
  USING (user_id::text = current_setting('diabot.user_id', true));

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT unnest(ARRAY['bg_logs','bp_logs','weight_logs','water_logs','meal_logs','insulin_logs','feature_flags','metrics_day']) AS tbl
  LOOP
    EXECUTE format('
      DROP POLICY IF EXISTS p_%1$s_select ON %1$s;
      CREATE POLICY p_%1$s_select ON %1$s
        FOR SELECT USING (
          EXISTS (SELECT 1 FROM profiles p
                  WHERE p.id = %1$s.profile_id
                  AND p.user_id::text = current_setting(''diabot.user_id'', true))
        );
      DROP POLICY IF EXISTS p_%1$s_mod ON %1$s;
      CREATE POLICY p_%1$s_mod ON %1$s
        USING (
          EXISTS (SELECT 1 FROM profiles p
                  WHERE p.id = %1$s.profile_id
                  AND p.user_id::text = current_setting(''diabot.user_id'', true))
        );
    ', r.tbl);
  END LOOP;
END$$;
