# LOG BG — Contract (V3)
Endpoint: POST /log/bg
Body:
- value: number (>0)
- unit: "mg/dL" | "mmol/L"
- context: "before" | "after2h" | "random"
- taken_at: ISOString (<= now)

Success: 201 Created
Errors: 400 (validation) | 401 (missing profile) | 403 (RLS) | 5xx

DB đích (OLTP): glucose_logs(id, profile_id, value, unit, context, ts)
Lưu ý: ts = taken_at
