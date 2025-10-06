#!/bin/sh

set -e

echo "== [#DIABOT_AI_FinalCheck] Running full validation =="

echo "-- Type check"
npm run type-check

echo "-- Smoke tests (3 case)"
sh scripts/ai_smoke.sh

echo "-- Batch tests (matrix)"
npx tsx scripts/ai_batch.ts

echo "-- Extended moat tests (5 case)"
sh scripts/test_extended.sh

echo "== ALL TESTS PASSED ✅ #DIABOT_AI_FinalCheck =="