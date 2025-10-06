# Pre-SQL Smoke

- ✅ unauth POST /api/log/bg — PASS · status=401
- ✅ unauth POST /api/log/water — PASS · status=401
- ✅ unauth POST /api/log/meal — PASS · status=401
- ✅ unauth POST /api/log/insulin — PASS · status=401
- ✅ unauth POST /api/log/weight — PASS · status=401
- ✅ unauth POST /api/log/bp — PASS · status=401
- ✅ unauth GET /api/charts/bg_avg?range=7d — PASS · status=401
- ✅ auth POST /api/log/bg — PASS · pre-SQL
- 🟡 auth POST /api/log/water — DB_NOT_READY · pre-SQL
- ✅ auth POST /api/log/meal — PASS · pre-SQL
- 🟡 auth POST /api/log/insulin — DB_NOT_READY · pre-SQL
- ✅ auth POST /api/log/weight — PASS · pre-SQL
- ✅ auth POST /api/log/bp — PASS · pre-SQL
- ✅ auth GET /api/charts/bg_avg?range=7d — PASS · pre-SQL
- ✅ profile self — PASS · status=200
- ✅ profile wrongId — PASS · status=403

# Post-Cache Meal Week Integration

- ✅ GET /api/charts/meal?range=7d — PASS · status=200
- ✅ meal cache data format — PASS · ok:true, data:Array
- ✅ meal cache RLS — PASS · user isolation verified
- ✅ meal cache backfill — PASS · 8 weeks processed
- ✅ meal cache seed demo — PASS · 2-3 weeks for demo user