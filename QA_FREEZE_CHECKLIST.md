# QA Freeze 0.9.0 - Checklist

**Date:** 2025-10-01
**Version:** 0.9.0
**Status:** Ready for QA Freeze

---

## Pre-Freeze Tasks

### 1. Database Setup

- [ ] Apply migration `40_feature_flags.sql` to Supabase
- [ ] Apply migration `41_relatives.sql` to Supabase
- [ ] Apply migration `42_nudge_events.sql` to Supabase
- [ ] Verify flags in DB:
  ```sql
  SELECT * FROM feature_flags;
  ```
  Expected: RELATIVE_ENABLED=false, NUDGE_ENABLED=false, SAFETY_RULES_ENABLED=false

### 2. Environment Variables

- [ ] Add to `.env.local` (optional, defaults work):
  ```bash
  RELATIVE_ENABLED=false
  NUDGE_ENABLED=false
  SAFETY_RULES_ENABLED=false
  ```

### 3. Build Verification

- [ ] Run `npm run build` → should PASS
- [ ] Run `npm run typecheck` → should PASS (or only show existing errors)
- [ ] Check build output includes new routes:
  - /api/relative/add
  - /api/relative/dashboard
  - /api/relative/log/[type]
  - /api/nudge/today
  - /api/nudge/ack

### 4. OFF-Mode Testing

- [ ] Start dev server: `npm run dev`
- [ ] Run test script: `bash scripts/test-features-off.sh`
- [ ] Expected: All tests PASS
  - All `/api/relative/*` return 404
  - All `/api/nudge/*` return 404
  - `/api/qa/selftest` returns feature flags

- [ ] Manual curl tests:
  ```bash
  # Should return 404
  curl -X POST http://localhost:3000/api/relative/add \
    -H "Content-Type: application/json" \
    -d '{"relative_id":"test","relation_type":"father","role":"viewer"}'

  # Should return 404
  curl http://localhost:3000/api/nudge/today

  # Should return 200 with featureFlags
  curl http://localhost:3000/api/qa/selftest | jq '.featureFlags'
  ```

### 5. Existing Features Smoke Test

- [ ] POST /api/log/bg → 201 (hoac 401 neu chua auth)
- [ ] POST /api/log/meal → 201
- [ ] POST /api/log/water → 201
- [ ] POST /api/log/bp → 201
- [ ] POST /api/log/weight → 201
- [ ] POST /api/log/insulin → 201
- [ ] GET /api/qa/selftest → 200

### 6. Git & Release Prep

- [ ] Commit all changes:
  ```bash
  git add supabase/migrations/4*.sql
  git add config/feature-flags.ts
  git add src/lib/middleware/featureGate.ts
  git add src/app/api/relative/
  git add src/app/api/nudge/
  git add docs/FAMILYLINK.md docs/PROACTIVE_NUDGE.md
  git add scripts/test-features-off.sh
  git add FEATURE_FLAGS_SUMMARY.md QA_FREEZE_CHECKLIST.md
  git commit -m "feat: add FamilyLink and Proactive Nudge (flags OFF for QA Freeze 0.9.0)"
  ```

- [ ] Tag current state:
  ```bash
  git tag v0.9.0-features-ready
  git push origin v0.9.0-features-ready
  ```

- [ ] Cut release branch:
  ```bash
  git checkout -b release/0.9.0-freeze
  git push origin release/0.9.0-freeze
  ```

---

## During QA Freeze

### Stability Checks

- [ ] Run full smoke tests: `npm run smoke`
- [ ] Run stability check: `npm run stability:check`
- [ ] Verify no crashes related to new code
- [ ] Verify existing features unchanged

### Performance Checks

- [ ] Build size acceptable (check Next.js output)
- [ ] No memory leaks in new middleware
- [ ] Page load times unchanged

### Documentation Review

- [ ] Review `docs/FAMILYLINK.md`
- [ ] Review `docs/PROACTIVE_NUDGE.md`
- [ ] Update CHANGELOG.md with new features (behind flags)

---

## Post-Freeze (After v0.9.0 Released)

### 1. Enable Features (Separate Branch)

- [ ] Create feature branch: `git checkout -b feat/enable-familylink develop`
- [ ] Update feature flags in DB:
  ```sql
  UPDATE feature_flags SET value = 'true' WHERE key = 'RELATIVE_ENABLED';
  ```
- [ ] Test all `/api/relative/*` endpoints return valid data (not 404)
- [ ] Implement full business logic (replace stubs)

### 2. FamilyLink Full Implementation

- [ ] Implement `/api/relative/add` full logic:
  - Get user_id from auth
  - Validate relative_id exists in profiles
  - Insert into relatives table
  - Handle duplicates
- [ ] Implement `/api/relative/dashboard` full logic:
  - Check access via RLS
  - Aggregate logs (BG, meal, water, BP, weight, insulin)
  - Return formatted dashboard data
- [ ] Implement `/api/relative/log/:type` full logic:
  - Check editor role
  - Insert log with logged_by metadata
  - Emit audit event

### 3. Proactive Nudge Full Implementation

- [ ] Enable flag:
  ```sql
  UPDATE feature_flags SET value = 'true' WHERE key = 'NUDGE_ENABLED';
  ```
- [ ] Implement `/api/nudge/today` full logic:
  - Check time window (06:00-21:00 or night opt-in)
  - Generate nudges based on rules:
    - missing_log: check last log times
    - post_meal_walk: check recent meals
    - water_reminder: check water intake vs goal
    - bg_check: check BG safety (< 70 or > 250)
  - Filter out dismissed nudges (cooldown 6h)
  - Return max 2 nudges sorted by priority
- [ ] Implement `/api/nudge/ack` full logic:
  - Get profile_id from auth
  - Generate request_id
  - Insert into nudge_events table
  - Return success

### 4. UI Implementation

- [ ] Create `src/interfaces/ui/components/organisms/FamilyLinkPanel.tsx`
- [ ] Create `src/interfaces/ui/hooks/useFamilyLink.ts`
- [ ] Update ProfilePage: add FamilyLink section (hidden if flag OFF)
- [ ] Update Log Forms: add "Toi / Nguoi than" dropdown
- [ ] Create `src/interfaces/ui/components/molecules/NudgeBanner.tsx`
- [ ] Create `src/interfaces/ui/hooks/useNudges.ts`
- [ ] Update Home/Dashboard: add NudgeBanner (hidden if flag OFF)

### 5. QA ON-Mode

- [ ] Test RLS:
  - Relative A can see User B's data (if linked)
  - Relative A cannot see User C's data (if not linked)
  - Cross-profile queries return 0 rows
- [ ] Test log on-behalf:
  - Editor can insert all 6 log types
  - Viewer cannot insert logs (403)
- [ ] Test nudge timing:
  - Nudges only show 06:00-21:00
  - No nudges 21:00-06:00 (unless night opt-in)
- [ ] Test nudge safety:
  - No exercise nudge when BG < 70
  - No exercise nudge when BG > 250
- [ ] Test apply rate:
  - Monitor user interactions
  - Calculate apply_rate >= 30%
- [ ] Monitor crash-free >= 99.5%

---

## Rollback Plan

If issues arise:

1. **Immediate rollback (OFF flags):**
   ```sql
   UPDATE feature_flags SET value = 'false' WHERE key IN ('RELATIVE_ENABLED', 'NUDGE_ENABLED');
   ```

2. **Git rollback (if needed):**
   ```bash
   git checkout release/0.9.0-freeze
   git reset --hard v0.9.0-features-ready
   ```

3. **Database rollback (if needed):**
   ```sql
   DROP TABLE IF EXISTS nudge_events CASCADE;
   DROP TABLE IF EXISTS relatives CASCADE;
   DROP TABLE IF EXISTS feature_flags CASCADE;
   DROP TYPE IF EXISTS nudge_type CASCADE;
   DROP TYPE IF EXISTS nudge_action CASCADE;
   DROP TYPE IF EXISTS relation_type CASCADE;
   DROP TYPE IF EXISTS relative_role CASCADE;
   ```

---

## Success Criteria

### Pre-Freeze

✅ All OFF-mode tests pass
✅ Build succeeds
✅ No crashes
✅ Existing features unchanged

### Post-Freeze (ON-mode)

✅ RLS isolation works correctly
✅ FamilyLink dashboard shows correct data
✅ Nudges respect time windows
✅ Nudges respect safety rules (BG thresholds)
✅ Apply rate >= 30%
✅ Crash-free >= 99.5%
✅ No PII logged in events

---

## Contact & Support

- **Feature Owner:** [Your Name]
- **QA Lead:** [QA Lead Name]
- **Release Manager:** [Release Manager Name]

For issues or questions, refer to:
- `docs/FAMILYLINK.md`
- `docs/PROACTIVE_NUDGE.md`
- `FEATURE_FLAGS_SUMMARY.md`
