# ADR-001: Supabase Client Unification

**Status:** Implemented
**Date:** 2025-10-02
**Decision Makers:** Development Team

## Context

The codebase had multiple Supabase client files (`browserClient.ts`, `serverClient.ts`, `adminClient.ts`) that created inconsistent import patterns and code duplication. This led to:

- Confusion about which client to import
- Duplicate singleton patterns across files
- Difficulty maintaining consistent configuration
- Import path inconsistency across the codebase

## Decision

We consolidated all Supabase client creation into two source-of-truth files:

### 1. `src/lib/supabase/client.ts`
- **Purpose:** Browser/server anon client (uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- **Export:** `client` (primary), `supabase` (legacy compatibility)
- **Pattern:** Constant singleton export

### 2. `src/lib/supabase/admin.ts`
- **Purpose:** Server-only admin client (uses `SUPABASE_SERVICE_ROLE_KEY`)
- **Export:** `admin` (primary), `supabaseAdmin()` (legacy compatibility)
- **Pattern:** Constant singleton export

### 3. Legacy Files → Re-export Shims
- `browserClient.ts` → re-exports from `client.ts`
- `serverClient.ts` → re-exports from `admin.ts`
- `adminClient.ts` → re-exports from `admin.ts`

This approach allows:
- Zero-downtime migration (all old imports still work)
- Gradual refactoring to new imports
- Easy rollback if issues arise

## AI Gateway Enhancement

Added stub mode to AI Gateway via environment flag:
- **Flag:** `AI_GATEWAY_STUB=true`
- **Purpose:** Allow QA testing without OpenAI API key
- **Behavior:** Returns mock responses immediately, skipping LLM calls

## Implementation

### Changed Files (6)
1. `src/lib/supabase/client.ts` - Main anon client
2. `src/lib/supabase/admin.ts` - Main admin client (constant export)
3. `src/lib/supabase/browserClient.ts` - Shim re-export
4. `src/lib/supabase/serverClient.ts` - Shim re-export
5. `src/lib/supabase/adminClient.ts` - Shim re-export
6. `src/app/api/ai/gateway/route.ts` - Added stub mode

## Consequences

### Positive
- Single source of truth for each client type
- Consistent import patterns going forward
- Backward compatible with existing code
- Easier to maintain and test
- AI Gateway can run in stub mode for testing

### Negative
- Temporary code duplication in shim files (technical debt)
- Need to gradually migrate imports over time
- `admin.ts` throws error at module-scope if env vars missing (intentional for server-only usage)

## Migration Path

### Phase 1 (Current)
- All old imports work via shims
- New code should use `client` and `admin` directly

### Phase 2 (Gradual)
- Refactor imports module by module
- Update imports to use `@/lib/supabase/client` or `@/lib/supabase/admin`

### Phase 3 (Future)
- After 1+ weeks of green CI/CD
- Remove shim files when grep shows 0 usage
- Keep only `client.ts` and `admin.ts`

## Acceptance Criteria

✅ `npm run build` passes without import errors
✅ AI Gateway GET returns healthy status
✅ AI Gateway POST with `AI_GATEWAY_STUB=true` returns stub response
✅ No breaking changes to existing functionality
✅ All legacy imports still work via shims

## Rollback Plan

If issues arise:
1. Revert this PR (single commit)
2. All imports will return to original implementation
3. No data loss or migration issues (code-only change)

## References

- Related to: DIABOT v0.9.0 freeze stability requirements
- Follows: Clean Architecture principles (single responsibility)
- Enables: Future AI Gateway enhancements
