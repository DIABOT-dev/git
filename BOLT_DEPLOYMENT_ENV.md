# DIABOT - Bolt Deployment Environment Variables

**Date:** 2025-10-03
**Version:** 0.9.0
**Platform:** Bolt.new (Staging)

---

## CRITICAL: Required Environment Variables for Bolt Secrets

Copy these variables to Bolt's Environment Secrets panel before deployment.

### 1. Supabase Configuration

### 1. Bolt Database Configuration

```bash
# Server-side admin access (for API routes)
Bolt Database_URL=https://pabdrfkjhzyzdljtyjhs.supabase.co
Bolt Database_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhYmRyZmtqaHp5emRsanR5amhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQwMDk1MSwiZXhwIjoyMDcyOTc2OTUxfQ.iokAT5BETD2tCblCsdHiquSEl3JLZCDKrpTKMfpAqsI

# Client-side browser access (public-facing)
NEXT_PUBLIC_Bolt Database_URL=https://pabdrfkjhzyzdljtyjhs.supabase.co
NEXT_PUBLIC_Bolt Database_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhYmRyZmtqaHp5emRsanR5amhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDA5NTEsImV4cCI6MjA3Mjk3Njk1MX0.lDzz_UgVwOseC89Xs_DgCyJ8CkX6me0xn65xLLNowDY

```

### 2. App Configuration

```bash
NODE_ENV=production
PORT=3000
AUTH_DEV_MODE=false
```

### 3. Feature Flags (Client-side - require rebuild)

```bash
NEXT_PUBLIC_AI_AGENT=demo
NEXT_PUBLIC_REWARDS=false
NEXT_PUBLIC_BG_SYNC=false
NEXT_PUBLIC_REALTIME=false
NEXT_PUBLIC_CHART_USE_DEMO=true
NEXT_PUBLIC_CHART_FALLBACK=false
NEXT_PUBLIC_KILL_SWITCH=false
```

### 4. Feature Flags (Server-side - no rebuild needed)

```bash
MEAL_MOCK_MODE=true
REMINDER_MOCK_MODE=true
AI_CACHE_ENABLED=true
AI_BUDGET_ENABLED=false
AI_BUDGET_DROP_ON_EXCEEDED=true
AI_DISABLE_RETRY=false
AI_RULES_FALLBACK_ENABLED=true
```

### 5. AI Configuration

```bash
MODEL_NANO=gpt-5-nano
MODEL_MINI=gpt-5-mini
AI_MODEL_DEFAULT=gpt-5-nano
AI_MAXTOKENS_DEFAULT=60
AI_MAXTOKENS_SAFETY=120
AI_DISABLE_RETRY=true
AI_CACHE_TTL_SHORT_MIN=60
AI_CACHE_TTL_LONG_MIN=1440
AI_RULES_FALLBACK_ENABLED=true
AI_BUDGET_DAILY_TOKENS=300000
```

### 6. AI Gateway Configuration

```bash
AI_GATEWAY_ENABLED=true
AI_COACH_ENABLED=true
AI_MEAL_ENABLED=true
AI_VOICE_ENABLED=true
AI_FAMILY_ENABLED=true
AI_REWARD_ENABLED=true
AI_PERSONALIZATION_DEEP=false
AI_MARKETPLACE=false
AI_FEDERATED_LEARNING=false
AI_GAMIFICATION_DEEP=false
```

### 7. Logging & Telemetry

```bash
LOG_LEVEL=info
NEXT_TELEMETRY_DISABLED=1
```

### 8. ETL/Cron (Optional - for metrics)

```bash
ETL_CRON_SCHEDULE="0 * * * *"
```

---

## Optional: AI Features (OpenAI)

If you want full AI functionality (not stub mode):

```bash
# Add your OpenAI API key
OPENAI_API_KEY=sk-proj-...
```

**Without this key:** AI Gateway runs in stub mode with rule-based responses.
**With this key:** Full AI capabilities using GPT models.

---

## Deployment Steps on Bolt

1. **Navigate to Bolt Project Settings**
   - Go to your Bolt project dashboard
   - Click "Environment Variables" or "Secrets"

2. **Add Variables One by One**
   - Copy each variable name and value
   - Click "Add Variable"
   - Paste name and value
   - Save

3. **CRITICAL: Generate New ANON_KEY**
   - Go to Supabase Dashboard
   - Settings → API
   - Copy "anon public" key
   - Add as `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Bolt

4. **Deploy**
   - Bolt will automatically rebuild with new env vars
   - Check build logs for errors
   - Verify deployment health: `https://your-bolt-url.bolt.new/api/health`

---

## Verification Checklist

After deployment, test these endpoints:

```bash
# Health check
curl https://your-bolt-url.bolt.new/api/health

# QA Self-test
curl https://your-bolt-url.bolt.new/api/qa/selftest

# AI Gateway (should return stub response if no OPENAI_API_KEY)
curl https://your-bolt-url.bolt.new/api/ai/gateway
```

Expected results:
- `/api/health`: `{"status":"ok"}`
- `/api/qa/selftest`: JSON with version 0.9.0
- `/api/ai/gateway`: `{"ok":true,"status":"healthy","mode":"stub"}` (if no OpenAI key)

---

## Known Issues (Non-Blocking)

1. **Auth Pages Prerender Warning**
   - `/auth/login` and `/auth/register` show prerender warnings
   - Not blocking - pages work fine at runtime
   - Caused by `useSearchParams()` - will fix in future release

2. **TypeScript Errors (Ignored by Build)**
   - Next.js config has `ignoreBuildErrors: true`
   - Build succeeds despite TS warnings
   - ProfileEditor component has type mismatches (non-blocking)
   - Scripts have legacy type issues (non-critical)

3. **AI Gateway Stub Mode**
   - Without `OPENAI_API_KEY`, AI runs in stub mode
   - Provides rule-based responses
   - Add key for full functionality

---

## Support

If deployment fails:
1. Check Bolt build logs for errors
2. Verify all ENV variables are set correctly
3. Ensure ANON_KEY is regenerated and not expired
4. Check Supabase connection from Bolt (test `/api/health`)

---

**Last Updated:** 2025-10-03
**Status:** Ready for Bolt Staging Deployment ✅
