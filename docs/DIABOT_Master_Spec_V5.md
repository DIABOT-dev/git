DIABOT – Master Specification (V5)
Cập nhật: 2025-10-02
MVP Freeze Boundary: 2025-09-23
Document Owner: DIABOT Team
---------------------------------------------

# 0. Executive Summary
DIABOT là trợ lý AI hỗ trợ người tiểu đường quản lý lối sống: ghi log chỉ số quan trọng (đường huyết, nước, cân nặng, huyết áp, insulin, bữa ăn), xem biểu đồ ngắn hạn (7/30 ngày), nhắc nhở, gợi ý thực đơn, xuất báo cáo. V5 là bản hợp nhất cuối trước khi reset sang dự án sạch cho giai đoạn hậu-MVP.

**Mục tiêu V5**
- Gom toàn bộ tri thức rải rác trong log cũ → thành tài liệu master duy nhất.
- Đặt mốc MVP Freeze (23/09/2025) → mọi nội dung trước mốc coi như chốt.
- Chuẩn bị nền tảng “nhẹ” cho dự án mới (chat mới, file master này làm nguồn).

**Triết lý thiết kế**
- Don’t Make Me Think (UI/UX tối giản), an toàn (RLS), và chạy được offline basic (graceful fallback).
- Clean Architecture, feature flags, và khả năng scale (OLAP-lite cho chart, export).

---------------------------------------------

# 1. Scope & Features

## 1.1 Core logging (P0)
- Đường huyết (BG): giá trị, đơn vị, bối cảnh (trước ăn/sau ăn/đói), timestamp.
- Nước (Water): ml, timestamp.
- Cân nặng (Weight): kg, timestamp.
- Huyết áp (Blood Pressure): systolic, diastolic, pulse, timestamp.
- Insulin: liều, loại (rapid/basal), bối cảnh, timestamp.
- Bữa ăn (Meal): loại bữa (sáng/trưa/tối/phụ), text mô tả, khẩu phần, timestamp (⏳ UI/chart còn lại).

## 1.2 Dashboards
- Biểu đồ 7 ngày và 30 ngày (line/area)
- Summary hôm qua (avg BG, tổng nước, số log…)
- Fallback khi chưa có data (demo data có cờ bật/tắt).

## 1.3 Reminders
- Nhắc BG nếu >72h không log.
- Cân 3 ngày/lần, BP 3 ngày/lần, nước theo cốc.
- Client-side trước; về sau đẩy lên server scheduler.

## 1.4 AI Agent
- **Demo mode (FREE)**: rule-based + template; giải thích chỉ số, nhắc 3 hành động vàng/ngày; gợi ý thực đơn mức cơ bản.
- **Premium (phase tiếp)**: cá nhân hóa thực đơn (HbA1c, gout, mỡ máu…), phân tích trend, voice chat giọng Việt.
- Safety rails: không chẩn đoán/kê thuốc; cảnh báo nguy hiểm → khuyên gặp bác sĩ.

## 1.5 Export
- PDF/CSV: tóm tắt tuần/tháng, biểu đồ, bảng log.

## 1.6 FamilyLink (Phase sau MVP)
- Dashboard người thân: nhận cảnh báo, xem báo cáo tuần.
- Chế độ **Cảnh báo 24h linh hoạt**: kích hoạt thủ công; ban đêm tạm dừng trừ khi người dùng xác nhận tiếp tục trước 21:00; AI có thể gọi hỏi thăm (tương lai).

---------------------------------------------

# 2. Business Tiers & Monetization

## 2.1 Free (giữ chân + mồi câu)
- Voice logging cơ bản, checklist 3 hành động vàng/ngày.
- Dashboard cơ bản (7/30 ngày, summary hôm qua).
- Missions + coin nhỏ, micro-training video.
- Cảnh báo nhẹ, thực đơn gợi ý tuần, kết nối người thân (nhắc thuốc, báo cáo tuần).
- Xuất PDF/CSV cơ bản.

## 2.2 Premium (nguồn thu chính)
- AI cá nhân hóa thực đơn chi tiết theo hồ sơ.
- AI Voice Chat (giọng Việt), Auto-log nâng cao (NLU → structured).
- Phân tích nâng cao (trend, HbA1c, theo bữa), cảnh báo thông minh.
- Missions mở rộng, ưu đãi combo Sâm.
- (Phase sau) kết nối bác sĩ.

## 2.3 Gói & Flow
- Trial Premium **7 ngày** → **Grace 3 ngày** → Free.
- Giá: **200k/tháng**, **2tr/năm**.
- Cross-sell: coin đổi voucher/mẫu sâm; upsell qua người thân.

---------------------------------------------

# 3. Architecture & Data Flow

## 3.1 Clean Architecture Layout
/src
  /domain        (entities, value objects, usecases)
  /application   (services, DTO, feature_flags, validators)
  /infrastructure(supabase repo, schedulers, adapters, cache)
  /interfaces    (api routes, ui/pages, hooks, components)

**Nguyên tắc**
- Domain **không** import infra.
- API chỉ đi qua Application.
- Chart UI chỉ đọc Chart DB (OLAP-lite), không query trực tiếp OLTP.
- Feature flags điều khiển hiển thị/tính năng.
- CI/CD: lint → unit → contract → integration → e2e → deploy.

## 3.2 Data Flow (OLTP → ETL → OLAP-lite → UI)
App → API → Supabase (OLTP) → ETL job (cron) → Chart DB (OLAP-lite) → UI
- Reminders chạy client-side; ảnh bữa ăn lưu Storage.
- Export đọc cache OLAP-lite để nhanh và ổn định.

## 3.3 Feature Flags (ví dụ)
- ai_agent_demo, ai_agent_premium, charts, insulin, rewards, familylink, exports.

---------------------------------------------

# 4. Database Schema (Supabase)

## 4.1 OLTP (ghi log)
- profiles(id, user_id, name, dob, gender, height_cm, chronic_notes, created_at)
- glucose_logs(id, profile_id, value, unit, context, ts, note)
- meal_logs(id, profile_id, meal_type, text, portion, ts, photo_url)
- water_logs(id, profile_id, ml, ts)
- weight_logs(id, profile_id, kg, ts)
- bp_logs(id, profile_id, systolic, diastolic, pulse, ts)
- insulin_logs(id, profile_id, dose, type, context, ts, note)
- feature_flags(profile_id, ai_agent_demo, ai_agent_premium, charts, insulin, rewards, updated_at)

## 4.2 OLAP-lite (chart/cache)
- metrics_day(profile_id, date, avg_bg, total_water, avg_weight, avg_bp_sys, avg_bp_dia, logs_count)
- metrics_week(profile_id, week, avg_bg, total_water, logs_count)
- cache_meal_week(profile_id, week, summary_json)

## 4.3 RLS & Bảo mật
- Tất cả bảng OLTP/OLAP-lite bật RLS.
- Policy: user_id = auth.uid() qua bảng profiles.
- Service role chỉ dùng cho ETL/server jobs; **không** đưa vào client.
- Storage policy cho ảnh bữa ăn: chỉ chủ sở hữu đọc/ghi.

---------------------------------------------

# 5. API Surface (rút gọn)

## 5.1 Public (auth guard)
- GET /api/qa/selftest → 200 nếu service sẵn sàng.
- GET /api/chart/(7d|30d) → trả dữ liệu từ OLAP-lite.
- GET /api/profile → thông tin profile (scoped).

## 5.2 Logging
- POST /api/log/bg|water|weight|bp|insulin|meal → 201 (validate Zod).
- GET /api/log/:type?from=…&to=… → danh sách theo phạm vi.

## 5.3 AI & Exports
- GET /api/meal/suggest (cache 15’) → đề xuất bữa cơ bản (demo).
- POST /api/meal/feedback → thu thập phản hồi.
- GET /api/export/(pdf|csv) → xuất báo cáo.

---------------------------------------------

# 6. UI/UX Standards

## 6.1 Tokens & Controls
- Font ≥ 15.5px; contrast ≥ 4.5; nút ≥ 44px; radius-xl.
- Spacing grid 8/12/16; padding card ≥ 16; gap hợp lý.
- Form insulin: footer submit, gradient nhẹ, bo tròn.

## 6.2 Behavior
- Chart luôn hiển thị (fallback demo nếu không có dữ liệu).
- Prefetch nhẹ; tránh layout shift.
- Micro-motion tinh tế; icon set đồng nhất.

## 6.3 Accessibility
- Focus ring rõ; mô tả label/aria; đủ khoảng chạm.

---------------------------------------------

# 7. Compliance (Terms / Privacy / Health)

## 7.1 Subscription & Payments
- Trial 7 ngày → Grace 3 ngày; chỉ áp dụng khi **bật Premium**.
- Trên bản MVP **chưa bật** in-app purchase: nội dung có thể để trong Terms/Privacy dưới dạng “future clause”; không cần khai báo gói trong store cho tới khi bật.

## 7.2 Privacy Policy (song ngữ)
- Thu thập: BG, BP, weight, water, meal text/photo, device info tối thiểu.
- Mục đích: cung cấp tính năng, nhắc nhở, cá nhân hóa (khi bật Premium).
- Lưu trữ: Supabase (region…), mã hóa at-rest & in-transit.
- Quyền người dùng: xuất/đổi/xóa; liên hệ DPO.
- Không bán dữ liệu. Chia sẻ hạn chế cho xử lý (CDN, crash/log) theo hợp đồng.
- Account deletion flow minh bạch.

## 7.3 Health Disclaimer
- Ứng dụng **không** thay thế chẩn đoán/y lệnh bác sĩ.
- Trong trường hợp nguy hiểm (BG quá cao/thấp…), hiển thị khuyến cáo gặp bác sĩ.

---------------------------------------------

# 8. QA Freeze & Security

## 8.1 QA Freeze Checklist
- [ ] Log BG/meal/water/weight/bp/insulin → 201.
- [ ] Chart 7d/30d đọc đúng OLAP-lite (demo fallback OK).
- [ ] Reminders chạy đúng tần suất.
- [ ] AI Agent demo on/off theo flag.
- [ ] Crash-free ≥ 99.5%.
- [ ] RLS: user chỉ thấy dữ liệu của mình.
- [ ] Smoke Docker: /api/qa/selftest 200; / redirect login 302; /auth/login 200.
- [ ] ENV: không lộ service role key client-side; .env.example đầy đủ.

## 8.2 Bảo mật
- RLS bắt buộc; tách service role; rotate key định kỳ.
- CSP, CSRF chỗ cần thiết; rate limit API.
- Ẩn stack traces production; audit logs tối thiểu.

---------------------------------------------

# 9. Deployment & Ops

## 9.1 Docker & GHCR
- Pull: ghcr.io/<org>/<repo>:<tag|sha|latest>
- Run: docker run -d --name diabot -p 3000:3000 --env-file .env ghcr.io/<org>/<repo>:<tag>
- Wait ready: for i in {1..30}; do curl …/api/qa/selftest == 200; done

## 9.2 ENV Stewardship
- .env.local.example: đầy đủ placeholders; không commit secrets.
- Inject secrets runtime cho Docker/k8s.
- Scripts: smoke, qa_checklist, stability-check.

---------------------------------------------

# 10. Roadmap (sau MVP)

## 10.1 P1 – Irritants (spacing, font, copy)
- Sửa spacing 8/12/16; font baseline; microcopy thống nhất.

## 10.2 P2 – Polish
- Corner radius, shadow, icon set; prefetch; tránh layout shift.
- Cập nhật UI_FIX_LOG.md; liệt kê file; auto-commit.

## 10.3 FamilyLink & Alerts
- Cảnh báo 24h linh hoạt; logic chặn ban đêm trừ khi user cho phép trước 21:00.

## 10.4 AI Premium
- Cá nhân hóa thực đơn sâu; voice chat; trend & risk insights.

## 10.5 Compliance & Store
- Terms/Privacy/Health hoàn chỉnh; App Store/Play Store readiness; DUNS.

---------------------------------------------

# 11. Marketing Playbook

## 11.1 Hooks & AIDA
- Vấn đề: kiểm soát đường huyết khó, ăn uống rối; mệt mỏi theo dõi.
- Khuếch đại: biến chứng tim mạch/gan/thận; stress gia đình.
- Giải pháp: DIABOT – ghi log nhanh, biểu đồ dễ hiểu, nhắc đúng lúc, gợi ý bữa phù hợp.
- CTA: tải app, thử Premium 7 ngày; kết nối người thân.

## 11.2 16 bước bán hàng (rút gọn áp dụng)
- Attention → Connection → Problem → Targeting → Agitate → Hook → Solution → Benefits → USP → Trust → Social Proof → Offer → Scarcity → CTA → Objection Handling → Close.

## 11.3 Nội dung & Hashtag
- Chuẩn QC nền tảng; trung lập; bằng chứng/ checklist dễ áp dụng; CTA rõ.
- Ví dụ hashtag: #kiểmsoátđườnghuyết #sốngkhỏe #tiểuđường #chếđộăn #diabot

---------------------------------------------

# 12. Phụ lục

## 12.1 Event/Edge cases
- BG quá cao/thấp → cảnh báo, hướng dẫn an toàn.
- Mất mạng → queue local và sync sau.
- Trùng timestamp → hợp nhất hoặc đánh dấu duplicate.

## 12.2 Kiểm thử nhanh (CLI)
- GET /api/qa/selftest → 200
- GET / (HEAD) chưa login → 302 /login
- GET /auth/login → 200

## 12.3 Tài liệu dev
- ADR-001 AI Gateway (stub mode); Feature Flags; Chart fallback; ENV policies.

---------------------------------------------

# 13. Ranh giới MVP Freeze
**Included**
- Log BG/Water/Weight/BP/Insulin
- Chart 7/30 + summary hôm qua (demo fallback)
- Reminders cơ bản
- AI Demo mode (rule-based)
- Export PDF/CSV cơ bản
- RLS bật; QA smoke pass

**Out of Scope**
- AI Premium đầy đủ (voice chat, trend sâu)
- Bác sĩ online
- Gamification nâng cao
- FamilyLink hoàn chỉnh (chỉ spec, chưa ship)
- In-app purchase trên store (future clause)

---------------------------------------------

# 14. Ghi chú Reset Sau MVP
- Chat GPT mới sẽ nhập tài liệu này và làm nguồn tri thức chính.
- Mọi trao đổi sau đó dựa trên đặc tả V5; không cần kéo lại log cũ.
