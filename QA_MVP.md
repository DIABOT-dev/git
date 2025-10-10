## 2025-10-10 14:54 ICT – Post-merge on main
- Seed profile_id used: 9c913921-9fc6-41cc-a45f-ea05a0f34f2a
- Commands (exact):
  - psql "$DIABOT_DB_URL" -c "EXPLAIN SELECT * FROM bg_logs WHERE profile_id='9c913921-9fc6-41cc-a45f-ea05a0f34f2a' ORDER BY ts DESC LIMIT 20;"
  - curl -i -X POST http://localhost:3000/api/log/bg -H "Content-Type: application/json" -d '{"profile_id":"9c913921-9fc6-41cc-a45f-ea05a0f34f2a","value":120,"unit":"mg/dL","context":"fasting","ts":"2025-10-10T12:00:00Z"}'
  - curl -s "http://localhost:3000/api/chart/7d?profile_id=9c913921-9fc6-41cc-a45f-ea05a0f34f2a"
- Results: EXPLAIN PASS, POST 201, GET 200

2025-10-10 14:54 ICT – QA Freeze ✅ (main green: EXPLAIN PASS, POST 201, GET 200)
