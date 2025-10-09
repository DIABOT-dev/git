# Archive Policy — Bolt/Supabase Retirement

## Purpose
Document the archive-first workflow for removing legacy Bolt and Supabase assets while preserving auditability and rollback options.

## Scope
- Applies to all files moved into `archive/bolt_legacy/YYYY-MM-DD/`.
- Covers documentation, configuration, database artifacts, and scripts related to Bolt/Supabase.

## Process
1. **Inventory & Tag** — List every artifact slated for retirement inside `docs/tech/MIGRATION_FROM_BOLT.md` with its source path.
2. **Archive Move PR (Phase 1)**
   - Create a dated folder under `archive/bolt_legacy/`.
   - Move the artifacts verbatim, preserving relative path layout (e.g., `supabase/migrations/*`).
   - Update documentation to reference the archived location.
3. **Stabilization Window**
   - Retain archived assets for **4 weeks**.
   - Monitor CI/QA; if a regression requires rollback, recover the specific file as described below.
4. **Deletion PR (Phase 2)**
   - After the retention window and approval from the DIABOT platform team, delete the dated archive directory.
   - Update `docs/tech/MIGRATION_FROM_BOLT.md` to mark the artifacts as removed.

## Recovery Workflow
1. Create a feature branch.
2. Copy the required file from `archive/bolt_legacy/YYYY-MM-DD/` into a temporary workspace (do not edit inside the archive folder).
3. Apply necessary fixes or adaptations.
4. Open a PR detailing why the artifact is restored and how it aligns with the storage standardization roadmap.

## Guardrails
- **No direct Supabase/Bolt imports in active code:** enforce via `scripts/qa_no_bolt.mjs` and CI Quality Gate.
- **Docs & Index updates:** Whenever artifacts are archived or restored, update `docs/PROJECT_CONTEXT_INDEX.md` and the migration log.
- **Retention tracking:** Add the archive date to runbooks so operations knows when a directory can be purged.

## Contacts
For clarifications reach out to the DIABOT platform team or GPT Control. Escalate to security if archived assets include credentials or PII (they should not).
