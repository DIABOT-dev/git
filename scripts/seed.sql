-- Seed 1 profile cố định cho QA
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = '9c913921-9fc6-41cc-a45f-ea05a0f34f2a') THEN
    INSERT INTO profiles (id, user_id, name, dob, gender, height_cm, chronic_notes, created_at)
    VALUES ('9c913921-9fc6-41cc-a45f-ea05a0f34f2a',
            '00000000-0000-0000-0000-000000000000',
            'QA User', '1990-01-01', 'male', 170, 'seed profile', now());
  END IF;
END $$;
