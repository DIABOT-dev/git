# DIABOT - Schema Standardization Summary

**Completed**: 2025-10-07
**Version**: 1.0 Post-MVP Preparation
**Status**: ✅ Ready for Database Application

---

## 🎯 EXECUTIVE SUMMARY

Schema chuẩn hóa hoàn tất, chuẩn bị cho các tính năng AI và Storage trên Viettel Cloud. Tất cả thay đổi được thiết kế **backward compatible** - không ảnh hưởng dữ liệu và chức năng hiện có.

---

## ✅ ĐÃ HOÀN THÀNH

### 1. Documentation Created

| File | Purpose |
|------|---------|
| `SCHEMA_STANDARDIZATION.md` | Chi tiết đầy đủ schema changes, DDL statements |
| `DEPLOYMENT_VIETTEL_STORAGE.md` | Hướng dẫn triển khai Viettel Object Storage |
| `STANDARDIZATION_SUMMARY.md` | Tóm tắt tổng quan (file này) |

### 2. Environment Configuration Updated

| File | Changes |
|------|---------|
| `.env.production` | ✅ Viettel S3 credentials configured |
| `.env.local` | ✅ Development environment configured |

**Viettel Storage Configuration**:
```bash
STORAGE_PROVIDER=viettel
S3_ENDPOINT=https://s3-north1.viettelidc.com.vn
S3_REGION=vn-1
S3_BUCKET=diabot-prod
S3_FORCE_PATH_STYLE=true
S3_SIGNATURE_VERSION=s3v4
```

### 3. Schema Design Completed

#### Core Storage Fields
- ✅ `meal_logs.image_url` (text) - Viettel Storage URLs
- ✅ `meal_logs.ai_tip_id` (uuid) - FK to AI meal tips
- ✅ `meal_logs.feedback_status` (enum) - User feedback tracking
- ✅ `meal_logs.source` (enum) - Log origin (user/AI)
- ✅ `profiles.avatar_url` (text) - User avatars

#### OTP Authentication
- ✅ `profiles.phone_verified` (boolean) - OTP verification status
- ✅ `profiles.otp_last_verified_at` (timestamptz) - Last verification
- ✅ Unique constraint on `phone` field

#### AI Profile Extensions
- ✅ `profiles.persona` (enum: friend/coach/caregiver)
- ✅ `profiles.plan_tier` (enum: free/premium/family)
- ✅ `profiles.ai_chat_model` (enum: nano/mini/turbo)
- ✅ `profiles.feature_flags` (jsonb) - Per-user AI config
- ✅ `profiles.ai_budget_vnd` (int) - Cost tracking
- ✅ `profiles.ai_tokens_month` (int) - Token usage
- ✅ `profiles.token_reset_at` (timestamptz) - Billing cycle
- ✅ `profiles.family_group_id` (uuid) - Family linking

#### AI Tables (DDL Ready)
- ✅ `family_groups` - Family collaboration
- ✅ `relatives` - Family member linking
- ✅ `ai_meal_tips` - Meal suggestions
- ✅ `ai_chat_sessions` - Conversation tracking
- ✅ `ai_chat_messages` - Chat messages
- ✅ `ai_factchecks` - Information verification
- ✅ `qc_safety_logs` - Content moderation
- ✅ `ai_nudges` - Smart reminders
- ✅ `ai_voice_logs` - Voice input tracking
- ✅ `ai_reports` - Generated reports

### 4. Storage Path Conventions

```
meal/{user_id}/{yyyy}/{mm}/{dd}/{uuid}.{ext}
avatars/{user_id}.{ext}
voice/{user_id}/{yyyy}/{mm}/{uuid}.{ext}
reports/{user_id}/{report_type}_{period_end}.pdf
```

### 5. Security (RLS)
- ✅ All new tables have RLS enabled by default
- ✅ Policies restrict data to owner/authorized users only
- ✅ Family access controlled via helper functions
- ✅ Service role for admin operations only

---

## 📋 NEXT STEPS - DEPLOYMENT

### Phase 1: Database Schema Updates (Priority)

1. **Review Schema Document**
   ```bash
   # Read full schema details
   cat SCHEMA_STANDARDIZATION.md
   ```

2. **Apply Schema Changes** (via Supabase Dashboard or SQL Editor)
   - Copy DDL statements from `SCHEMA_STANDARDIZATION.md`
   - Execute section by section:
     - Section 1: Core Storage Fields
     - Section 2: OTP Authentication
     - Section 3: AI Profile Extensions
     - Section 4-8: AI Tables (if ready)
     - Section 9: Storage Helper Function

3. **Verify Schema**
   ```sql
   -- Check new columns exist
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name IN ('profiles', 'meal_logs')
   ORDER BY table_name, ordinal_position;

   -- Check new tables exist
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name LIKE 'ai_%' OR table_name IN ('family_groups', 'relatives')
   ORDER BY table_name;
   ```

### Phase 2: Viettel Storage Implementation

1. **Install AWS SDK**
   ```bash
   npm install @aws-sdk/client-s3
   npm install @aws-sdk/s3-request-presigner
   ```

2. **Complete ViettelS3Client**
   - Implement upload method with multipart support
   - Add presigned URL generation
   - Test with production credentials

3. **Update Upload API**
   - Modify `src/app/api/upload/image/route.ts`
   - Replace Supabase Storage with ViettelS3Client
   - Test upload workflow

4. **Test Storage**
   ```bash
   # Test upload
   curl -X POST http://localhost:3000/api/upload/image \
     -H "Authorization: Bearer TOKEN" \
     -F "file=@test.jpg"
   ```

### Phase 3: TypeScript Updates

1. **Update Domain Types**
   ```typescript
   // src/domain/types.ts
   export interface MealLog {
     // ... existing fields
     image_url?: string;
     ai_tip_id?: string;
     feedback_status?: 'applied' | 'ignored' | 'modified';
     source?: 'user' | 'ai_suggested';
   }

   export interface Profile {
     // ... existing fields
     avatar_url?: string;
     phone_verified?: boolean;
     otp_last_verified_at?: string;
     persona?: 'friend' | 'coach' | 'caregiver';
     plan_tier?: 'free' | 'premium' | 'family';
     ai_chat_model?: 'nano' | 'mini' | 'turbo';
     feature_flags?: Record<string, any>;
     ai_budget_vnd?: number;
     ai_tokens_month?: number;
     token_reset_at?: string;
     family_group_id?: string;
   }
   ```

2. **Update Repositories**
   - Modify `MealRepo.supabase.ts` to include image_url
   - Update profile queries to include new fields

3. **Run Type Check**
   ```bash
   npm run typecheck
   ```

### Phase 4: Feature Flags

All AI features default to **OFF** via environment variables:

```bash
# Current state (already set)
AI_FAMILY_ENABLED=false
AI_MEAL_TIPS_ENABLED=false  # Add this
AI_CHAT_ENABLED=false        # Add this
AI_VOICE_ENABLED=false
AI_NUDGES_ENABLED=false      # Add this
```

Enable incrementally as features are ready.

### Phase 5: Testing

1. **Schema Verification**
   - [ ] All new columns created
   - [ ] All new tables created
   - [ ] RLS policies active
   - [ ] Indexes created

2. **Storage Testing**
   - [ ] Upload meal image to Viettel S3
   - [ ] Generate presigned URLs
   - [ ] Verify public access
   - [ ] Test path generation function

3. **Integration Testing**
   - [ ] Existing features work unchanged
   - [ ] No data loss
   - [ ] Performance acceptable
   - [ ] Error handling graceful

4. **Security Testing**
   - [ ] RLS prevents unauthorized access
   - [ ] Storage paths secure
   - [ ] OTP validation works
   - [ ] Token tracking accurate

---

## 🔍 VERIFICATION CHECKLIST

### Database Schema
```sql
-- Verify meal_logs extensions
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'meal_logs' AND column_name IN ('image_url', 'ai_tip_id', 'feedback_status', 'source');

-- Verify profiles extensions
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name IN ('avatar_url', 'phone_verified', 'persona', 'plan_tier', 'ai_chat_model');

-- Verify AI tables exist
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public' AND (
  table_name LIKE 'ai_%' OR
  table_name IN ('family_groups', 'relatives')
);
-- Expected: 9 tables
```

### Environment Variables
```bash
# Check Viettel config loaded
node -e "require('dotenv').config({ path: '.env.production' }); console.log('Storage:', process.env.STORAGE_PROVIDER, '\nEndpoint:', process.env.S3_ENDPOINT)"

# Expected output:
# Storage: viettel
# Endpoint: https://s3-north1.viettelidc.com.vn
```

### Storage Helper Function
```sql
-- Test path generation
SELECT public.generate_storage_path('meal', 'a9d5518d-ee4c-49ca-8b20-5a2d4aaa16a2', 'jpg');
-- Expected format: meal/a9d5518d-ee4c-49ca-8b20-5a2d4aaa16a2/2025/10/07/UUID.jpg

SELECT public.generate_storage_path('avatar', 'a9d5518d-ee4c-49ca-8b20-5a2d4aaa16a2', 'png');
-- Expected format: avatars/a9d5518d-ee4c-49ca-8b20-5a2d4aaa16a2.png
```

---

## 🛡️ SAFETY MEASURES

### Backward Compatibility
- ✅ All new fields are nullable
- ✅ Default values provided where appropriate
- ✅ Existing queries continue to work
- ✅ No breaking changes to current functionality

### Rollback Plan
If issues arise:
1. New columns can be left null (no impact)
2. AI tables remain empty (no data to clean up)
3. Set `STORAGE_PROVIDER=disabled` to bypass storage
4. Existing features continue working

### Data Safety
- ✅ No destructive operations (DROP, DELETE)
- ✅ No data migration required (FRESH start)
- ✅ RLS prevents data leaks
- ✅ Transactions for batch operations

---

## 📊 SCHEMA STATISTICS

### Tables Added: 9
- family_groups
- relatives
- ai_meal_tips
- ai_chat_sessions
- ai_chat_messages
- ai_factchecks
- qc_safety_logs
- ai_nudges
- ai_voice_logs
- ai_reports

### Columns Added: 15
**profiles**: 10 new columns
- avatar_url, phone_verified, otp_last_verified_at
- persona, plan_tier, ai_chat_model, feature_flags
- ai_budget_vnd, ai_tokens_month, token_reset_at, family_group_id

**meal_logs**: 4 new columns
- image_url, ai_tip_id, feedback_status, source

### Enums Added: 5
- feedback_status (3 values)
- meal_source (2 values)
- ai_persona (3 values)
- plan_tier (3 values)
- ai_model (3 values)

### Indexes Added: 12+
- Storage path indexes
- AI table performance indexes
- Family relationship indexes

### RLS Policies: 30+
- All new tables protected
- Owner-based access control
- Family member access helpers

---

## 💡 IMPORTANT NOTES

### Storage Migration
- **NO MIGRATION NEEDED** - Fresh start with Viettel S3
- Old Supabase Storage bucket can be left as-is
- No existing images to migrate

### Feature Rollout
- All AI features controlled by flags
- Enable incrementally: meal tips → chat → family → voice
- Monitor costs with token tracking

### Cost Management
- Viettel Storage: ~$0.03/GB/month
- Token budget: Default 50,000 VND/user/month
- Auto-reset on monthly billing cycle

### Security
- Production credentials in `.env.production`
- **NEVER commit to public repository**
- Use environment-specific configs
- RLS enforced on all sensitive data

---

## 📞 SUPPORT & REFERENCES

### Documentation
- Full Schema: `SCHEMA_STANDARDIZATION.md`
- Storage Guide: `DEPLOYMENT_VIETTEL_STORAGE.md`
- Master Spec: `docs/DIABOT_Master_Spec_V5.md`
- Family Link: `docs/FAMILYLINK.md`
- Proactive Nudge: `docs/PROACTIVE_NUDGE.md`

### Database Access
- Supabase Dashboard: https://pabdrfkjhzyzdljtyjhs.supabase.co
- SQL Editor: Use for applying schema changes
- Database: diabot-postgres (production)

### Viettel Cloud
- Endpoint: https://s3-north1.viettelidc.com.vn
- Region: vn-1 (North Vietnam)
- Bucket: diabot-prod
- API: AWS S3 compatible

---

## ✅ FINAL STATUS

| Component | Status | Ready for Production |
|-----------|--------|---------------------|
| Schema Documentation | ✅ Complete | Yes |
| Environment Config | ✅ Updated | Yes |
| Storage Config | ✅ Configured | Yes - needs SDK implementation |
| Database Schema | ⏳ Pending | Ready to apply |
| Type Definitions | ⏳ Pending | After schema applied |
| Feature Flags | ✅ Set | Yes (all OFF) |
| RLS Policies | ✅ Designed | Ready to apply |
| Testing Plan | ✅ Documented | Yes |

**Overall**: Schema standardization hoàn tất. Ready for database application.

---

**Generated**: 2025-10-07
**Document Owner**: DIABOT Team
**Next Review**: After schema deployment
