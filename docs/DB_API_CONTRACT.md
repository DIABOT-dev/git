# DB–API CONTRACT (v1, 2025-10-10)

Mục tiêu: API chỉ đọc/ghi đúng các bảng/cột đã chốt, dùng đúng index/view để nhanh & ổn định.

## 0) Quy ước chung
- `profile_id`: UUID • `ts`: TIMESTAMPTZ
- RLS bắt buộc: user chỉ thấy dữ liệu gắn với `profiles.user_id`.
- Mọi `*_logs` đều có index:  
  - `(<profile_id>, <ts> DESC)` và `(profile_id)` (phục vụ truy vấn gần nhất & join).
- Mọi `*_logs.profile_id` FK → `profiles(id)` ON DELETE CASCADE.

---

## 1) Bảng nguồn (ghi/đọc)

### profiles
| cột | kiểu | ghi chú |
|---|---|---|
| id (PK) | UUID | default gen_random_uuid() |
| user_id | UUID | map tới auth |
| name | TEXT | |
| dob | DATE | |
| gender | TEXT | enum tự do |
| height_cm | INTEGER | |
| chronic_notes | TEXT | |
| created_at | TIMESTAMPTZ | default now() |
**Index:** `profiles_user_id_idx (user_id)`

### bg_logs
| cột | kiểu | ghi chú |
|---|---|---|
| id (PK) | UUID | |
| profile_id (FK) | UUID | → profiles(id) |
| value | NUMERIC(6,2) | mg/dL hoặc mmol/L quy đổi |
| unit | TEXT | 'mg/dL' \| 'mmol/L' |
| context | TEXT | 'fasting' \| 'pre_meal' \| 'post_meal' \| 'random' |
| ts | TIMESTAMPTZ | |
| note | TEXT | optional |
**Index:** `(profile_id, ts DESC)`, `(profile_id)`

### bp_logs
| cột | kiểu |
|---|---|
| id (PK) | UUID |
| profile_id (FK) | UUID |
| systolic | INTEGER |
| diastolic | INTEGER |
| pulse | INTEGER |
| ts | TIMESTAMPTZ |
**Index:** `(profile_id, ts DESC)`, `(profile_id)`

### weight_logs
| cột | kiểu |
|---|---|
| id (PK) | UUID |
| profile_id (FK) | UUID |
| kg | NUMERIC(6,2) |
| ts | TIMESTAMPTZ |
**Index:** `(profile_id, ts DESC)`, `(profile_id)`

### water_logs
| cột | kiểu |
|---|---|
| id (PK) | UUID |
| profile_id (FK) | UUID |
| ml | INTEGER |
| ts | TIMESTAMPTZ |
**Index:** `(profile_id, ts DESC)`, `(profile_id)`

### meal_logs
| cột | kiểu |
|---|---|
| id (PK) | UUID |
| profile_id (FK) | UUID |
| meal_type | TEXT | 'breakfast' \| 'lunch' \| 'dinner' \| 'snack' |
| text | TEXT |
| portion | TEXT |
| ts | TIMESTAMPTZ |
| photo_url | TEXT |
**Index:** `(profile_id, ts DESC)`, `(profile_id)`

### insulin_logs
| cột | kiểu |
|---|---|
| id (PK) | UUID |
| profile_id (FK) | UUID |
| dose | NUMERIC(6,2) |
| type | TEXT | 'rapid' \| 'basal' |
| context | TEXT | optional |
| ts | TIMESTAMPTZ |
| note | TEXT |
**Index:** `(profile_id, ts DESC)`, `(profile_id)`

### feature_flags
| cột | kiểu |
|---|---|
| profile_id (PK, FK) | UUID |
| ai_agent_demo | BOOLEAN |
| ai_agent_premium | BOOLEAN |
| charts | BOOLEAN |
| insulin | BOOLEAN |
| rewards | BOOLEAN |
| updated_at | TIMESTAMPTZ |
**Index:** `(profile_id)`

---

## 2) OLAP-lite (chỉ đọc)

### metrics_day
| cột | kiểu | ghi chú |
|---|---|---|
| profile_id | UUID | |
| date | DATE | |
| avg_bg | NUMERIC(6,2) | |
| total_water | INTEGER | ml |
| avg_weight | NUMERIC(6,2) | kg |
| avg_bp_sys | INTEGER | |
| avg_bp_dia | INTEGER | |
| logs_count | INTEGER | |
**Index:** `(profile_id, date)`

### v_metrics_week (VIEW)
| cột | kiểu |
|---|---|
| profile_id | UUID |
| week_start | DATE |
| avg_bg | NUMERIC(6,2) |
| total_water | INTEGER |
| logs_count | INTEGER |

### v_metrics_month (VIEW)
| cột | kiểu |
|---|---|
| profile_id | UUID |
| month_start | DATE |
| logs_count | INTEGER |

> View chỉ SELECT; không UPDATE/INSERT.

---

## 3) Mapping API ↔ Data
| Endpoint | Hành động | Nguồn |
|---|---|---|
| POST `/api/log/bg` | ghi BG | `bg_logs` |
| GET `/api/log/bg` | đọc BG theo `profile_id`, `from`, `to` | `bg_logs` |
| POST `/api/log/(bp|weight|water|meal|insulin)` | ghi | bảng tương ứng |
| GET `/api/log/(...)` | đọc theo `profile_id`, `from`, `to` | bảng tương ứng |
| GET `/api/profile` | đọc | `profiles` |
| GET `/api/chart/7d` | đọc 7 ngày | `metrics_day` |
| GET `/api/chart/30d` | đọc 30 ngày | `metrics_day` |
| GET `/api/chart/week` | đọc tuần | `v_metrics_week` |
| GET `/api/chart/month` | đọc tháng | `v_metrics_month` |

---

## 4) Kiểm tra build/QA (tối thiểu)
- Index tồn tại: `\di *bg_logs*` … `\di *insulin_logs*`
- View đọc được: `SELECT * FROM v_metrics_week LIMIT 1;`
- RLS còn hiệu lực: user A không xem được dữ liệu user B.
- Selftest: `/api/qa/selftest` → 200.

*Contract này là “luật chơi”. Thay đổi schema/view/index → phải cập nhật file và chạy lại QA.*
