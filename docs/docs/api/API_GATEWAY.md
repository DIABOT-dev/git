# DIA BRAIN API Gateway – DIABOT Integration

## 🔗 Base URL
https://diabot.top/api/ai/*

## 🧠 Main Endpoints
| Endpoint | Method | Description |
|-----------|---------|-------------|
| `/api/ai/healthz` | GET | Check service status |
| `/api/ai/v1/predict/bg_next` | POST | Predict next blood glucose |
| `/api/qa/selftest` | GET | Smoke test (read-only prod) |

## 🔐 Auth
- Token-based (internal), handled by DIA BRAIN.
- GPT không giữ token, chỉ gửi request qua gateway.

## ⚙️ Example Request
curl -X POST https://diabot.top/api/ai/v1/predict/bg_next   -H "Content-Type: application/json"   -d '{"bg": 145, "carbs": 30, "insulin": 2, "time": "12:00"}'

Response:
{"bg_next": 157, "risk": "normal"}
