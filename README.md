# DIABOT — Clean Scaffold (Next.js 14.2 + Postgres + Docker)

## 🔒 CHECKPOINT (DO NOT TOUCH)

**Commit baseline:** v5-mvp-base-2025-10-13  
**Branch:** `main`  
**Status:** ✅ Infra Stable | Functional Freeze Pending (#auth)

---

### 🧩 Summary
DIABOT là trợ lý AI giúp người tiểu đường quản lý lối sống:  
ghi log 6 chỉ số (BG, nước, cân nặng, huyết áp, insulin, bữa ăn),  
xem biểu đồ 7 / 30 ngày, xuất PDF/CSV và chat AI demo.

---

## 🚀 Quick Start

```bash
# 1️⃣ Clone
git clone https://github.com/<org>/<repo>.git diabot
cd diabot

# 2️⃣ ENV
cp .env.example .env.local
# Điền thông tin Postgres, Viettel S3, API Key, v.v.

# 3️⃣ Docker run
docker compose up -d --build

# 4️⃣ Smoke test
curl -i http://localhost:3000/api/qa/selftest   # expect 200
🧠 Architecture (V5)
pgsql
Sao chép mã
src/
 ├─ domain/          → entities, usecases
 ├─ application/     → services, DTO, validators
 ├─ infrastructure/  → db (Postgres), schedulers, storage adapter
 └─ interfaces/      → api routes, ui/pages, hooks, components
Domain không import infra.

API → Application → Domain chuẩn Clean Architecture.

RLS (Postgres) bắt buộc; không dùng Supabase runtime.

Feature flags điều khiển AI, chart, rewards, v.v.

🧾 QA Smoke Checklist (V5)
Endpoint	Expect	Note
/api/qa/selftest	200	Service ready
/auth/login	200	Form render
/	302 → /login (nếu chưa login)	✅ fix auth-core
/api/log/bg	201	Zod validated
/api/chart/7d	200	OLAP-lite demo fallback OK

🧱 Functional Freeze Plan
Phase	Target	Tag
Infra Freeze	Docker + DB + CI/CD ổn định	v0.9.1-freeze-infra
Auth Fix	Signup/Login usable + redirect đúng	v0.9.2-freeze-functional
AI Ready	Chat demo kết nối OK	v0.9.3-freeze-ai

🛠 Critical Rules
❌ Không commit Supabase runtime hay keys.

🔒 .env.example chỉ chứa placeholder, không secret.

✅ Mọi PR phải qua CI và QA Smoke pass.

🧩 Không force-push lên main.

🚫 Không touch branch v4-ui-pass.

🧑‍💻 Team Notes
Tech Lead: Trần Quang Tùng

QA Lead: Đặng Tuấn Anh

Product Owner: Trần Hoàng Nam

📜 License
© 2025 CÔNG TY CỔ PHẦN DIABOT — All rights reserved.

yaml
Sao chép mã

---

## ⚙️ Lệnh cho Codex khởi động lại (dán vào prompt Codex)

```bash
#boltprompt
# TASK: Reset README & bắt đầu sửa auth-core theo đặc tả V5

1️⃣ Pull bản mới nhất từ main.
2️⃣ Ghi đè file git/README.md bằng bản V5 (đã cung cấp).
3️⃣ Tạo branch mới:
   git checkout -b fix/auth-core
4️⃣ Giữ nguyên mọi logic khác; chỉ xử lý:
   - Redirect / → /login nếu chưa có session
   - Sửa POST /auth/signup trả lỗi rõ hoặc tạo user thành công
5️⃣ Sau khi test pass:
   - Commit "fix(auth-core): functional freeze ready"
   - Push & tạo PR → main
6️⃣ Báo cáo kết quả QA qua tag #auth và #report.
