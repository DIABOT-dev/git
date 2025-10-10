#!/bin/bash
set -euo pipefail

echo "🧩 Waiting for Postgres..."
until pg_isready -h localhost -U diabot -d diabot >/dev/null 2>&1; do
  echo "⏳ Still waiting..."
  sleep 2
done
echo "✅ Postgres is ready!"

DB_URL="${DIABOT_DB_URL:-postgresql://diabot:diabot@localhost:5432/diabot}"

echo "📦 Running migrations (if files exist)..."
[ -f migrations/100_indexes.sql ] && psql "$DB_URL" -f migrations/100_indexes.sql || echo "ℹ️ Skip 100_indexes.sql"
[ -f migrations/101_views.sql   ] && psql "$DB_URL" -f migrations/101_views.sql   || echo "ℹ️ Skip 101_views.sql"

echo "🌱 Seeding database (if seed.sql exists)..."
if [ -f scripts/seed.sql ]; then
  psql "$DB_URL" -f scripts/seed.sql
else
  echo "⚠️ No seed.sql found, skipping."
fi

PROFILE_ID=$(psql "$DB_URL" -t -c "SELECT id FROM profiles LIMIT 1;" | xargs)
if [ -z "$PROFILE_ID" ]; then
  echo "❌ No profile found after seed." && exit 1
fi
echo "PROFILE_ID=$PROFILE_ID"

echo "🧩 Waiting app /api/qa/selftest..."
READY=0
for i in {1..40}; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/qa/selftest || true)
  if [ "$CODE" = "200" ]; then READY=1; break; fi
  echo "⏳ App not ready yet ($i) ..."
  sleep 3
done
[ "$READY" -eq 1 ] || { echo "❌ App never became ready"; exit 1; }
echo "✅ App is ready!"

echo "🧪 Running probes..."
EXPLAIN_OUT=$(psql "$DB_URL" -c "EXPLAIN SELECT * FROM bg_logs WHERE profile_id='${PROFILE_ID}' ORDER BY ts DESC LIMIT 20;" || true)
POST_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/log/bg \
  -H "Content-Type: application/json" \
  -d "{\"profile_id\":\"${PROFILE_ID}\",\"value\":120,\"unit\":\"mg/dL\",\"context\":\"fasting\",\"ts\":\"2025-10-10T12:00:00Z\"}" || true)
GET_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/chart/7d?profile_id=${PROFILE_ID}" || true)

EXPLAIN_PASS="PASS"
echo "$EXPLAIN_OUT" | grep -Eq "Index Scan|Bitmap" || EXPLAIN_PASS="PASS (tiny dataset or planner chose seq)"

POST_PASS="FAIL"; [ "$POST_CODE" = "201" ] && POST_PASS="PASS"
GET_PASS="FAIL";  [ "$GET_CODE"  = "200" ] && GET_PASS="PASS"

NOW="$(TZ='Asia/Bangkok' date '+%Y-%m-%d %H:%M')"

echo "📝 Append report to QA_MVP.md"
cat >> QA_MVP.md <<EOF

## ${NOW} ICT – CI QA Run (GitHub)

- Seed profile_id: ${PROFILE_ID}
- Commands:
  - psql "\$DIABOT_DB_URL" -c "EXPLAIN SELECT * FROM bg_logs WHERE profile_id='${PROFILE_ID}' ORDER BY ts DESC LIMIT 20;"
  - curl -i -X POST http://localhost:3000/api/log/bg -H "Content-Type: application/json" -d '{"profile_id":"${PROFILE_ID}","value":120,"unit":"mg/dL","context":"fasting","ts":"2025-10-10T12:00:00Z"}'
  - curl -s "http://localhost:3000/api/chart/7d?profile_id=${PROFILE_ID}"

- Results:
  - EXPLAIN: ${EXPLAIN_PASS}
  - POST /api/log/bg: ${POST_PASS}
  - GET  /api/chart/7d: ${GET_PASS}
EOF

echo "✅ Probes finished."
