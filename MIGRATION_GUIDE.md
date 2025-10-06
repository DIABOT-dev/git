# Migration Guide - Feature Flags (0.9.0)

**Migrations:** 40, 41, 42
**Features:** FamilyLink, Proactive Nudge
**Status:** Safe to apply (flags OFF by default)

---

## Overview

Ba migrations moi de ho tro FamilyLink va Proactive Nudge:

1. **40_feature_flags.sql** - Bang feature flags voi RLS
2. **41_relatives.sql** - Bang relatives voi RLS + helper functions
3. **42_nudge_events.sql** - Bang nudge_events cho tracking

---

## Apply Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Mo Supabase Dashboard → SQL Editor
2. Tao New Query va paste noi dung cua `40_feature_flags.sql`
3. Run query → verify thanh cong
4. Lap lai voi `41_relatives.sql` va `42_nudge_events.sql`

### Option 2: Supabase CLI

```bash
# Install Supabase CLI (neu chua co)
npm i -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

### Option 3: Manual SQL (cho production)

```bash
# Connect to database
psql postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Apply migrations
\i supabase/migrations/40_feature_flags.sql
\i supabase/migrations/41_relatives.sql
\i supabase/migrations/42_nudge_events.sql

# Verify
\dt feature_flags
\dt relatives
\dt nudge_events
```

---

## Verify Migrations

### 1. Check tables exist

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('feature_flags', 'relatives', 'nudge_events');
```

Expected: 3 rows

### 2. Check feature flags

```sql
SELECT * FROM feature_flags;
```

Expected:
```
key                     | value | description
------------------------|-------|----------------------------
RELATIVE_ENABLED        | false | FamilyLink - Allow relatives...
NUDGE_ENABLED           | false | Proactive Nudge - Context-aware...
SAFETY_RULES_ENABLED    | false | Enhanced safety rules...
```

### 3. Check RLS enabled

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('feature_flags', 'relatives', 'nudge_events');
```

Expected: All rowsecurity = true

### 4. Check helper functions

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%relative%' OR routine_name LIKE '%nudge%';
```

Expected functions:
- can_access_user_data
- has_editor_role
- get_user_nudge_apply_rate
- get_user_nudge_stats

---

## Test After Migration

### 1. Test feature flags access

```sql
-- As authenticated user (should work)
SET request.jwt.claims.sub = 'some-user-id';
SELECT * FROM feature_flags;

-- As anon (should fail)
RESET request.jwt.claims.sub;
SELECT * FROM feature_flags;
```

### 2. Test relatives RLS

```sql
-- Insert test data
INSERT INTO relatives (user_id, relative_id, relation_type, role)
VALUES (
  'user-1-uuid',
  'user-2-uuid',
  'father',
  'viewer'
);

-- Check access (as user-1, should see)
SET request.jwt.claims.sub = 'user-1-uuid';
SELECT * FROM relatives WHERE user_id = 'user-1-uuid';

-- Check isolation (as user-3, should NOT see)
SET request.jwt.claims.sub = 'user-3-uuid';
SELECT * FROM relatives WHERE user_id = 'user-1-uuid';
```

Expected: Second query returns 0 rows (RLS working)

### 3. Test nudge_events RLS

```sql
-- Insert test event
INSERT INTO nudge_events (profile_id, nudge_type, action, request_id)
VALUES (
  'user-1-uuid',
  'missing_log',
  'shown',
  'req-12345'
);

-- Check access (as user-1, should see)
SET request.jwt.claims.sub = 'user-1-uuid';
SELECT * FROM nudge_events WHERE profile_id = 'user-1-uuid';

-- Check isolation (as user-2, should NOT see)
SET request.jwt.claims.sub = 'user-2-uuid';
SELECT * FROM nudge_events WHERE profile_id = 'user-1-uuid';
```

Expected: Second query returns 0 rows (RLS working)

---

## Rollback Procedure

Neu gap van de, co the rollback:

### 1. Drop tables (careful, data loss!)

```sql
DROP TABLE IF EXISTS nudge_events CASCADE;
DROP TABLE IF EXISTS relatives CASCADE;
DROP TABLE IF EXISTS feature_flags CASCADE;
```

### 2. Drop custom types

```sql
DROP TYPE IF EXISTS nudge_type CASCADE;
DROP TYPE IF EXISTS nudge_action CASCADE;
DROP TYPE IF EXISTS relation_type CASCADE;
DROP TYPE IF EXISTS relative_role CASCADE;
```

### 3. Drop helper functions

```sql
DROP FUNCTION IF EXISTS can_access_user_data(uuid, uuid);
DROP FUNCTION IF EXISTS has_editor_role(uuid, uuid);
DROP FUNCTION IF EXISTS get_user_nudge_apply_rate(uuid, int);
DROP FUNCTION IF EXISTS get_user_nudge_stats(uuid, int);
DROP FUNCTION IF EXISTS update_feature_flag_timestamp();
```

---

## Migration Impact

### Database Size

- feature_flags: ~1KB (3 rows)
- relatives: depends on usage (estimate ~100 bytes/row)
- nudge_events: depends on usage (estimate ~200 bytes/event)

### Performance

- RLS policies add minimal overhead (<1ms per query)
- Helper functions cached by PostgreSQL
- Indexes on foreign keys for fast lookups

### Dependencies

- Requires `profiles` table (already exists)
- Requires `auth.users` table (Supabase built-in)
- Requires `auth.uid()` function (Supabase built-in)

---

## Troubleshooting

### Issue: Migration fails with "relation already exists"

**Solution:** Tables may already exist. Check:
```sql
\dt feature_flags
\dt relatives
\dt nudge_events
```

If exist, skip migration or drop tables first (careful!).

### Issue: RLS policies fail with "permission denied"

**Solution:** Ensure you're using service_role key for admin operations:
```sql
-- Check current role
SELECT current_user;

-- Should be 'postgres' or 'service_role'
```

### Issue: Helper functions not working

**Solution:** Check function definitions:
```sql
\df can_access_user_data
\df has_editor_role
```

If missing, re-run migration 41.

---

## Next Steps

After migrations applied successfully:

1. ✅ Verify all checks pass (see above)
2. ✅ Run `bash scripts/test-features-off.sh` (should all pass)
3. ✅ Deploy application
4. ✅ Monitor logs for any RLS violations
5. ✅ Proceed with QA Freeze 0.9.0

---

## Support

For issues:
- Check `FEATURE_FLAGS_SUMMARY.md`
- Check `QA_FREEZE_CHECKLIST.md`
- Check `docs/FAMILYLINK.md` and `docs/PROACTIVE_NUDGE.md`
