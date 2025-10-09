#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const srcDir = path.join(repoRoot, "src");

const transitionalSupabaseAllowlist = new Set([
  "src/infrastructure/repositories/GlucoseLogsRepo.ts",
  "src/infrastructure/repositories/ProfilesRepo.ts",
  "src/infrastructure/repositories/MetricsRepo.ts",
  "src/infrastructure/schedulers/coachTriggers.ts",
  "src/application/services/buildUserContext.ts",
  "src/infra/repositories/SupabaseWaterRepository.ts",
  "src/infra/repositories/SupabaseInsulinRepository.ts",
  "src/infra/repositories/SupabaseMealRepository.ts",
  "src/infra/repositories/SupabaseBloodGlucoseRepository.ts",
  "src/interfaces/api/log/water/water.ts",
  "src/interfaces/api/log/insulin/insuline.ts",
  "src/interfaces/api/log/meal/meal.ts",
  "src/interfaces/api/log/bp/bp.ts",
  "src/interfaces/api/log/weight/weight.ts",
  "src/interfaces/api/elt/daily.ts",
  "src/app/api/upload/image/route.ts",
  "src/interfaces/api/chart/get.ts",
  "src/app/api/log/bg/route.ts",
  "src/app/api/log/water/route.ts",
  "src/app/api/log/insulin/route.ts",
  "src/interfaces/ui/screens/Dashboard.tsx",
  "src/app/api/log/meal/route.ts",
  "src/app/api/log/bp/route.ts",
  "src/app/api/log/weight/route.ts",
  "src/app/api/qa/evaluate/route.ts",
  "src/app/api/qa/selftest/route.ts",
  "src/app/api/healthz/route.ts",
  "src/app/api/meal/suggest/route.ts",
  "src/app/api/meal/feedback/route.ts",
  "src/app/api/profile/delete/route.ts",
  "src/app/api/profile/[id]/route.ts",
  "src/lib/auth/getUserId.ts",
  "src/lib/auth/serverClient.ts",
  "src/app/api/profile/goals/route.ts",
  "src/lib/analytics/eventTracker.ts",
  "src/app/api/export/route.ts",
  "src/app/api/chart/fallback/route.ts",
  "src/lib/supabase/admin.ts",
  "src/app/api/medications/route.ts",
  "src/lib/supabase/adminClient.ts",
  "src/lib/supabase/client.ts",
  "src/lib/supabase/browserClient.ts",
  "src/lib/supabase/serverClient.ts",
  "src/lib/supabase/server.ts",
  "src/app/api/medications/[id]/route.ts",
  "src/lib/db.ts",
  "src/app/api/reminders/route.ts",
  "src/app/api/reminders/[id]/route.ts",
  "src/app/api/ai/meal-tip/route.ts",
  "src/app/api/etl/daily/route.ts",
  "src/app/api/charts/meal/route.ts",
  "src/app/profile/page.tsx",
  "src/app/privacy/page.tsx",
  "src/app/profile/DeleteAccountButton.tsx",
  "src/app/profile/setup/page.tsx",
  "src/app/auth/callback/page.tsx",
  "src/app/auth/login/page.tsx",
  "src/app/auth/forgot-password/page.tsx",
  "src/app/auth/register/page.tsx",
  "src/app/auth/components/AppleSignInButton.tsx",
  "src/modules/bg/infrastructure/adapters/BGRepo.supabase.ts",
  "src/modules/bg/ui/BGForm.tsx",
  "src/modules/chart/infrastructure/adapters/ChartRepo.supabase.ts",
  "src/modules/chart/infrastructure/usecases/FetchLogTimeline.ts",
  "src/modules/chart/infrastructure/usecases/FetchChartData.ts",
  "src/modules/water/infrastructure/adapters/WaterRepo.supabase.ts",
  "src/modules/water/application/usecases/SaveWaterLog.ts",
  "src/modules/bp/infrastructure/adapters/BPRepo.supabase.ts",
  "src/modules/insulin/infrastructure/adapters/InsulinRepo.supabase.ts",
  "src/modules/bp/application/usecases/SaveBPLog.ts",
  "src/modules/insulin/application/usecases/SaveInsulinLog.ts",
  "src/modules/insulin/ui/InsulinForm.tsx",
  "src/modules/meal/infrastructure/MealRepo.supabase.ts",
  "src/modules/meal/infrastructure/FeatureStoreRepo.ts",
  "src/modules/ai/context.ts",
  "src/modules/ai/cache.ts",
  "src/modules/weight/infrastructure/adapters/WeightRepo.supabase.ts",
  "src/modules/meal/application/usecases/SaveMealLog.ts",
  "src/modules/weight/application/usecases/SaveWeightLog.ts",
  "src/domain/types.ts",
]);

const violations = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
    } else if (entry.isFile()) {
      await inspectFile(fullPath);
    }
  }
}

async function inspectFile(filePath) {
  const content = await readFile(filePath, "utf8");
  const relativePath = path.relative(repoRoot, filePath).split(path.sep).join("/");

  const hasBolt = /bolt/i.test(content);
  if (hasBolt) {
    violations.push({ file: relativePath, term: "bolt" });
  }

  const hasSupabase = /supabase/i.test(content);
  if (hasSupabase && !transitionalSupabaseAllowlist.has(relativePath)) {
    violations.push({ file: relativePath, term: "supabase" });
  }
}

await walk(srcDir);

if (violations.length > 0) {
  console.error("\n🚫 No-Bolt QA gate failed. Remove legacy Bolt/Supabase references:");
  for (const { file, term } of violations) {
    console.error(`  - ${file} → contains disallowed term: ${term}`);
  }
  console.error("\nUpdate docs/tech/MIGRATION_FROM_BOLT.md if additional exceptions are required.");
  process.exit(1);
}

console.log("✅ No-Bolt QA gate passed — no unauthorized Bolt/Supabase references in src/**");
