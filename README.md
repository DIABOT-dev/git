# DIABOT – bước-một scaffold (Next.js 14.2 + Supabase)

## 🔒 CHECKPOINT (DO NOT TOUCH)

**Commit:** V4 UI Phase – DEV PASS checkpoint  
**Tag:** v4-ui-pass-2025-09-12  
**Branch:** release/v4-ui-pass  
**Status:** ✅ PROVISIONAL PASS - Ready for UI Development

### 🚨 Emergency Rollback (When tests fail or UI breaks):

```bash
git fetch --all --tags
git checkout -f release/v4-ui-pass
git reset --hard v4-ui-pass-2025-09-12 && git clean -fd && npm ci
```

**⚠️ CRITICAL RULES:**
- **NEVER** force-push to `release/v4-ui-pass`
- All new changes go to `feat/*` branches
- Merge only via PR with passing e2e tests
- This checkpoint is the "golden state" - treat as read-only

---

## 🚀 Quick Start

1) `cp .env.local.example .env.local` và điền URL/ANON.
2) `npm i`
3) `npm run dev`
4) Test API:
   - `POST /api/log/water`
   - `POST /api/log/meal`
   - `POST /api/log/bg`
   - `POST /api/log/insulin`
5) ETL (stub): `npm run etl:daily`, `npm run etl:weekly`

Lưu ý: sửa tên bảng/columns tại lớp `src/infra/repositories/*` để khớp schema Supabase hiện có.

## 🧪 QA Testing

### Internal QA Endpoints

```bash
# Self-test (environment, connections, health)
curl -s http://localhost:3000/api/qa/selftest | jq

# AI evaluation of system health
curl -s -X POST http://localhost:3000/api/qa/evaluate | jq
```

**Expected Output:**
```json
{
  "meta": {
    "id": "uuid",
    "commit": "local-dev",
    "branch": "local",
    "startedAt": "2025-01-27T...",
    "finishedAt": "2025-01-27T..."
  },
  "stats": {
    "total": 3,
    "passed": 3,
    "failed": 0,
    "warned": 0
  },
  "items": [...]
}
```

### Internal QA Endpoints

```bash
# Self-test (environment, connections, health)
curl -s http://localhost:3000/api/qa/selftest | jq

# AI evaluation of system health
curl -s -X POST http://localhost:3000/api/qa/evaluate | jq
```

**Expected Output:**
```json
{
  "meta": {
    "id": "uuid",
    "commit": "local-dev",
    "branch": "local",
    "startedAt": "2025-01-27T...",
    "finishedAt": "2025-01-27T..."
  },
  "stats": {
    "total": 3,
    "passed": 3,
    "failed": 0,
    "warned": 0
  },
  "items": [...]
}
```

## 🎛️ Feature Flags

Unified feature flag system in `config/feature-flags.ts`. Configure via environment variables in `.env.local`:

```bash
# Client-side flags (require rebuild when changed)
NEXT_PUBLIC_AI_AGENT=demo
NEXT_PUBLIC_REWARDS=false
NEXT_PUBLIC_BG_SYNC=false
NEXT_PUBLIC_CHART_USE_DEMO=true

# Server-side flags (no rebuild required)
MEAL_MOCK_MODE=true
REMINDER_MOCK_MODE=true
AI_CACHE_ENABLED=true
AI_BUDGET_ENABLED=false

# Safety & Control
NEXT_PUBLIC_KILL_SWITCH=false
AUTH_DEV_MODE=true
```

Use `getFeatureFlag('FLAG_NAME')` or `isFeatureEnabled('FLAG_NAME')` to check flags in code.

## 📊 Testing Status

- ✅ **Environment:** Node.js v20.14.2, Next.js ^14.2.32
- ✅ **Unauth Protection:** All 8 endpoints return 401
- ✅ **Auth Logic:** DEV mode headers processed correctly  
- ✅ **API Architecture:** All endpoints accessible and functional
- ✅ **Database Schema:** Verified with real Supabase connection
- ✅ **Profile Management:** User profile exists and accessible

**Recommendation:** ✅ **PROCEED TO UI DEVELOPMENT PHASE**

<!-- Test commitlint setup -->

# Moat Extended – DIABOT

## Mục tiêu
Các moat nâng cao, tách riêng, không trùng file với Moat Core.

## Danh sách
1. privacy.ts → enforcePrivacy(), auditLog()
2. trends.ts → analyzeTrends(ctx)
3. habit.ts → checkDailyHabits(), rewardCoins()
4. mealSuggest.ts → suggestMeal(ctx)
5. guardrails_ext.ts → validateExtended(ctx)

## Cách dùng
- Import từng moat vào gateway/route.ts khi cần.
- Không ghi đè Moat Core.
- Có thể bật/tắt bằng feature_flag trong DB sau này.
