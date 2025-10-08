# Quy ước #boltprompt (dùng trong ChatGPT)
Dùng các lệnh sau để GPT thao tác trực tiếp trên repo và VPS.

Ví dụ:
- `#boltprompt ops: deploy production`
- `#boltprompt ops: deploy staging PORT=3001`
- `#boltprompt ops: run QA_SMOKE`
- `#boltprompt ops: run backup now`
- `#boltprompt infra: rotate JWT_SECRET + restart`
- `#boltprompt app: patch /api/log/bg validator (Zod) + unit test`
- `#boltprompt ai: update meal_suggest cache TTL=15m`

Nguyên tắc:
- Rõ module (ops/infra/app/ai).
- Hành động ngắn gọn (deploy/run/patch/update).
- Tham số truyền theo dạng KEY=VALUE nếu cần.
