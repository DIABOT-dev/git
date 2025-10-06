# Proactive Nudge - Nhac kheo theo ngu canh

**Status:** Feature flag controlled (NUDGE_ENABLED)
**Version:** MVP Lite
**QA Freeze Compatibility:** OFF by default for 0.9.0

---

## Muc tieu & Pham vi

Tang "apply rate" va tan suat nhap lieu bang cac nhac kheo dung thoi diem:
- Sau bua an → goi y di bo
- Thieu log → nhac nhap BG/meal/water
- Uong nuoc → theo doi muc tieu ngay
- BG an toan → chi nhac BG check khi can thiet, khong nhac van dong khi BG bat thuong

**Logic nhac (client-first, rule-based):**
- Khong mo hoi thoai dai
- Toi da 1-2 nudges hien thi dong thoi
- Apply rate muc tieu: >= 30%

---

## Feature Flag

### 1. Bang feature_flags

```sql
INSERT INTO feature_flags (key, value, updated_at)
VALUES ('NUDGE_ENABLED', 'false', now())
ON CONFLICT (key) DO NOTHING;
```

### 2. Service doc flag

```typescript
import { getFeatureFlag } from '@/config/feature-flags';

const isEnabled = getFeatureFlag('NUDGE_ENABLED');
```

### 3. Gate tai API/UI

- **API**: `/api/nudge/*` tra 404 neu flag OFF
- **UI**: Khong hien NudgeBanner neu flag OFF

---

## Logic Nhac (Client-First, Rule-Based)

### 1. Thieu log hom qua/hom nay

```typescript
if (lastBGLog > 24h || noBGToday) {
  nudge = {
    type: 'missing_log',
    message: 'Ban chua nhap BG hom nay. Hay do ngay de theo doi suc khoe tot hon!',
    action: { label: 'Nhap ngay', route: '/log/bg' }
  };
}
```

### 2. Sau bua an 30-60 phut

```typescript
if (lastMealLog >= 30min && lastMealLog <= 60min) {
  nudge = {
    type: 'post_meal_walk',
    message: 'Di bo 10-15 phut giup BG phang hon. Ban co muon thu khong?',
    action: { label: 'Toi se di bo', route: null }
  };
}
```

### 3. Uong nuoc

```typescript
if (waterToday < waterGoal && waterToday < waterGoal * 0.7) {
  nudge = {
    type: 'water_reminder',
    message: 'Ban moi uong ${waterToday}ml / ${waterGoal}ml. Uong them 1 ly nuoc nhe!',
    action: { label: 'Da uong', route: '/log/water' }
  };
}
```

### 4. BG an toan

```typescript
// CHI nhac BG check khi can thiet
// KHONG nhac van dong neu BG < 70 (thap) hoac BG > 250 (cao)
if (latestBG < 70 || latestBG > 250) {
  // Khong nhac van dong, chi nhac nhap BG/an nhe
  nudge = {
    type: 'bg_check',
    message: 'BG hien tai ${latestBG}. Hay kiem tra lai va an nhe neu can.',
    action: { label: 'Nhap BG', route: '/log/bg' }
  };
}
```

---

## Khung thoi gian & Yen tinh ban dem

### Mac dinh: 06:00-21:00 (Ban ngay)

Nudges chi hien thi trong khung gio nay.

### Ngoai khung gio (21:00-06:00)

- Nudge tam hoan
- Truoc 21:00 co "Last check" hoi quyen duy tri ban dem

### Last Check (20:50)

Banner:
> "Ban co muon duy tri bao ve qua dem? Neu dong y, se co 1 check nhe trong dem. Neu khong, he thong se noi lai sang mai."

Neu user opt-in:
- Luu `profiles.prefs.night_guard_enabled = true`
- 1 check-in im lang trong dem (02:30)
- Khong leo thang neu khong phan hoi

Sang hom sau (06:00):
- Resume nudges ban ngay
- Neu dem qua no-answer → hien thi banner xac nhan

---

## Su kien & Do luong (Meta Only)

### Bang nudge_events

```sql
CREATE TABLE nudge_events (
  id uuid PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id),
  nudge_type nudge_type NOT NULL,
  action nudge_action NOT NULL,
  request_id text,
  created_at timestamptz DEFAULT now()
);
```

**nudge_type:** missing_log, post_meal_walk, water_reminder, bg_check
**nudge_action:** shown, clicked, dismissed, applied

### Metrics

**Apply rate:**
```sql
apply_rate = (clicked + applied) / shown * 100
```

**Muc tieu:** >= 30%

**Cac chi so khac:**
- Dismiss rate: monitor de cai thien UX
- Nudge frequency: toi da 3 nudges/ngay
- Check-in frequency: 1 lan/3h (ban ngay)

---

## API Endpoints

### GET /api/nudge/today

Tra danh sach nudge hop le cho user hien tai, da loc theo khung gio.

**Response (200):**
```json
{
  "success": true,
  "nudges": [
    {
      "id": "nudge-1",
      "type": "missing_log",
      "priority": 1,
      "message": "Ban chua nhap BG hom nay. Hay do ngay de theo doi suc khoe tot hon!",
      "action": {
        "label": "Nhap ngay",
        "route": "/log/bg"
      },
      "dismissible": true
    }
  ],
  "meta": {
    "current_time": "2025-10-01T10:00:00Z",
    "is_daytime": true,
    "max_nudges": 2
  }
}
```

**Response (404 if flag OFF):**
```json
{
  "error": "Feature not available",
  "code": "FEATURE_DISABLED",
  "flag": "NUDGE_ENABLED"
}
```

---

### POST /api/nudge/ack

User da xem/nhan nudge, ghi event meta.

**Request:**
```json
{
  "nudge_id": "nudge-1",
  "nudge_type": "missing_log",
  "action": "clicked"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Nudge event recorded",
  "data": {
    "id": "event-uuid",
    "profile_id": "user-id",
    "nudge_id": "nudge-1",
    "nudge_type": "missing_log",
    "action": "clicked",
    "request_id": "req-1234567890",
    "created_at": "2025-10-01T..."
  }
}
```

---

## UI Components

### 1. NudgeBanner (Banner the nho)

Hien thi o Home/Dashboard:
- **Khong modal chan man hinh**
- Banner the nho o dinh hoac duoi cung
- Hai nut nhanh: "Lam ngay" / "De sau"
- Toi da 1-2 nudges hien thi dong thoi

```tsx
<NudgeBanner
  nudge={{
    type: 'missing_log',
    message: 'Ban chua nhap BG hom nay...',
    action: { label: 'Nhap ngay', route: '/log/bg' }
  }}
  onAction={handleAction}
  onDismiss={handleDismiss}
/>
```

### 2. useNudges Hook

```typescript
const { nudges, loading, ack } = useNudges();

// Fetch nudges
useEffect(() => {
  if (isFeatureEnabled('NUDGE_ENABLED')) {
    fetchNudges();
  }
}, []);

// Acknowledge nudge
const handleAction = (nudgeId, action) => {
  ack({ nudge_id: nudgeId, action });
};
```

### 3. localStorage Tracker

Luu dismissed nudges, last shown time:
```typescript
localStorage.setItem('nudges_dismissed', JSON.stringify([
  { id: 'nudge-1', dismissed_at: '2025-10-01T10:00:00Z' }
]));
```

Cooldown: nudge dismissed khong hien lai trong 6h.

---

## Guardrails

### 1. Time Window Validator

```typescript
function isWithinTimeWindow(): boolean {
  const now = new Date();
  const hour = now.getHours();

  // Daytime: 06:00-21:00
  if (hour >= 6 && hour < 21) return true;

  // Night mode: check opt-in
  const nightGuardEnabled = getUserPrefs().night_guard_enabled;
  return nightGuardEnabled;
}
```

### 2. Safety Checker

```typescript
function canNudgeExercise(latestBG: number): boolean {
  // Khong nhac van dong neu BG < 70 hoac > 250
  if (latestBG < 70 || latestBG > 250) return false;
  return true;
}
```

### 3. Alert Throttle

- Toi da 3 nudges/ngay
- 1 check-in/3h (ban ngay)
- Cooldown 6h sau khi dismissed

---

## QA Scope

### OFF-mode (Pre-Freeze 0.9.0)

✅ Khong the nudge nao
✅ `/api/nudge/*` tra 404
✅ App khong crash

### ON-mode (Post-Freeze, QA rieng)

- Do apply rate: user interaction voi nudges (target >= 30%)
- Khong spam ban dem: chi hien nudges 06:00-21:00 (tru khi opt-in)
- Khong nudge van dong khi BG < 70 hoac > 250
- Test RLS: user chi thay nudge_events cua minh
- **Crash-free >= 99.5%**

---

## Ket qua mong doi

✅ Co module client rules (khung gio, dieu kien)
✅ Co API stubs nudge/today, nudge/ack + event tracker
✅ Co logic nhac theo ngu canh (post-meal, missing log, water, BG safety)
✅ Khong lam phien ban dem tru khi duoc opt-in
✅ Do luong apply rate de cai thien UX (target >= 30%)
