# Migration from Bolt & Supabase Artifacts

## Objective
Provide an inventory of Bolt/Supabase remnants and outline the non-destructive cleanup path before final removal.

## 1. Inventory Snapshot (2025-10-09)
### 1.1 Documentation & Reports
- `BOLT_DEPLOYMENT_ENV.md`
- `DEBOLT_SCAN.txt`
- `DEBOLT_COMPLETION_REPORT.md`
- `SUPABASE_CLIENT_REFACTOR_REPORT.md`
- ADRs & specs referencing Supabase (`archive/bolt_legacy/2025-10-09/docs/ADR-001_SUPABASE_CLIENT.md`, `DEPLOYMENT_VIETTEL_STORAGE.md`, etc.)

### 1.2 Configuration & Samples
- `.boltignore`
- `.env.local.example` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_*` placeholders)
- `AUTH_TESTING_GUIDE.md` (Supabase auth instructions)

### 1.3 Scripts & Tooling
- `scripts/codemod_supabase.js`
- Legacy deployment helpers in `deploy-viettel.sh` referencing Supabase fallbacks

### 1.4 Source Modules & Integrations
- `src/infra/repositories/Supabase*.ts`
- `src/modules/*/infrastructure/**/*Supabase*.ts`
- Supabase client shims under `src/shared` (to be confirmed)

### 1.5 Database Assets
- `archive/bolt_legacy/2025-10-09/supabase/migrations/` (44 SQL migration files moved from `supabase/` root)
- Any exported SQL dumps — **none detected**
- `backups/` folder currently empty (confirm before archive move)

## 2. Non-Destructive Cleanup Plan
### Step 0 — Preparation
1. Create `archive/bolt_legacy/` with README explaining transitional storage.
2. Establish CODEOWNERS or reviewer list for storage migration changes.

### Step 1 — Archive Move PR (Current Objective)
1. Relocate listed documentation, scripts, and sample configs into `archive/bolt_legacy/`.
2. Preserve directory structure when possible (e.g., keep `supabase/migrations` nested).
3. Update references to point to the archived location (e.g., from README or runbooks).
4. Leave symlinks or stubs only if required by build/test tooling; otherwise adjust imports before moving.

### Step 2 — Validation & Dependency Checks
1. Confirm no runtime code requires Supabase clients; replace with Viettel-backed adapters first.
2. Run CI smoke + targeted integration tests to verify DIA BRAIN storage flows.
3. Audit environment variables to remove `SUPABASE_*` usage after replacement lands.

### Step 3 — Deletion PR (Follow-up)
1. After stakeholders approve archive state, remove archived assets in a new PR.
2. Ensure backups exist for reference documents before deletion.
3. Update `docs/tech/STORAGE_POLICY.md` and context index to mark Bolt retirement complete.

## 3. Storage Compliance Checklist
- ✅ Upload/download path restricted to DIA BRAIN (per `docs/tech/STORAGE_POLICY.md`).
- ✅ Backups scheduled: database daily (30 copies), system config weekly (4 weeks).
- ⏳ Need to automate verification logs for backup jobs post-archive move.

## 4. Next Actions for GPT-dev.001
1. Gather owner confirmation for each Supabase adapter before relocation.
2. Draft the archive move PR with explicit file map.
3. Prepare communication package for DIABOT Team summarizing impact and required approvals.

## Appendix — Archive Map (2025-10-09)
| Original Location | Archived Location | Notes |
| --- | --- | --- |
| `supabase/migrations/*.sql` | `archive/bolt_legacy/2025-10-09/supabase/migrations/*.sql` | Supabase schema history kept for reference until deletion PR. |
| `docs/ADR-001_SUPABASE_CLIENT.md` | `archive/bolt_legacy/2025-10-09/docs/ADR-001_SUPABASE_CLIENT.md` | ADR retained for audit; storage policy supersedes Supabase client guidance. |
| `SUPABASE_CLIENT_REFACTOR_REPORT.md` | `archive/bolt_legacy/2025-10-09/SUPABASE_CLIENT_REFACTOR_REPORT.md` | Legacy refactor report stored for compliance traceability. |
