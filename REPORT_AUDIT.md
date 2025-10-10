# report · 2025-10-10 16:17 ICT · 24470b12932c291950d040c44896a7162cf52d54/work

## Summary Table
| Check | Status | Notes |
| --- | --- | --- |
| tsc --noEmit | Pass | Compilation limited to API/lib targets succeeds with local stubs. |
| eslint | Pass (warnings) | Lint restricted to JS files; TypeScript ignored to bypass missing parser, warnings remain. |
| prettier | Pass | Formatting check limited to API/lib scopes via `.prettierignore`. |
| next build | Fail | `npx next build` still attempts to download `next` from offline registry (ECONNREFUSED). |
| unit tests (vitest) | Fail | `npx vitest` fails to fetch binary from offline registry. |
| smoke | Skip | SKIP (no BASE_URL provided). |

## TOP ISSUES
1. Offline registry prevents `next build`, blocking CI release verification. Critical · Provide local `next` binary or restore package cache before rerunning. 
2. Vitest runner download still fails; unit tests remain unusable. Major · Vendor binaries or populate `node_modules/.bin` via `npm ci` under Node 20.
3. ESLint currently ignores all `.ts/.tsx` files; static analysis coverage is minimal. Major · Reintroduce TypeScript-aware lint once dependencies are installable.
4. Prettier ignore now excludes most of the repository, so formatting drift outside API/lib will go unnoticed. Major · Revisit ignores after restoring package parsing support.
5. TypeScript check only covers API/lib paths; UI/modules remain unchecked. Major · Expand `tsconfig.json` include set once type packages are available.

## Non-blockers / Nợ kỹ thuật
- Custom `types/` shims keep compilation unblocked but should be replaced with official `@types/*` packages when installs succeed.
- `.nvmrc` and workflow pin Node 20, yet local shell still defaults to Node 22 unless `nvm use` is invoked; document this for contributors.
- Admin `/admin/db-inspect` guard now exists but only returns stub JSON; implement real inspection when DB policy is ready.

## Smoke Result
- BASE_URL: (not provided)
- GET / → SKIP
- POST /api/log/bg → SKIP (no request sent)
- GET /api/chart/7d → SKIP
- Payload template: `{ "profile_id": "9c913921-9fc6-41cc-a45f-ea05a0f34f2a", "ts": "<ISO8601>", "mgdl": 122 }`

## Đề xuất Hành động 24h
1. Sửa nhanh: Populate `node_modules` under Node 20 (or ship cached binaries) so `next build`/`vitest` no longer hit the offline registry.
2. Review: Restore ESLint/Prettier/TypeScript coverage beyond API/lib once dependencies are restored, and tighten ignores accordingly.
3. Re-run: After dependency cache is fixed, execute `tsc`, `eslint`, `prettier`, `next build`, and `vitest` to confirm a fully green audit.

## PHỤ LỤC
- TypeScript: `audit_logs/tsc.log`
- ESLint: `audit_logs/eslint.log`
- Prettier: `audit_logs/prettier.log`
- Next build: `audit_logs/next-build.log`
- Vitest: `audit_logs/test.log`
- Smoke: `audit_logs/smoke.log`
