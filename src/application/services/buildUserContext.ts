import { createClient } from "@supabase/supabase-js";

export type UserContext = {
  bg_latest?: { value: number; unit: string; time_ago: string };
  water_today_ml?: number;
  last_meal?: { brief: string; ts: string } | null;
  weight_latest?: { kg: number; ts: string } | null;
  bp_latest?: { systolic: number; diastolic: number; ts: string } | null;
  streaks?: { bg_days: number };
  tz: string;
};

function supaAdmin() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!; // cần key service để đọc an toàn
  return createClient(url, key, { auth: { persistSession: false } });
}

function timeAgo(ts: string) {
  const ms = Date.now() - new Date(ts).getTime();
  const h = Math.floor(ms / 36e5);
  if (h < 1) return "vừa xong";
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  return `${d} ngày trước`;
}

export async function buildUserContext(user_id: string): Promise<UserContext> {
  const supa = supaAdmin();

  // BG gần nhất
  const { data: bg } = await supa
    .from("glucose_logs")
    .select("value, unit, ts")
    .eq("profile_id", user_id)
    .order("ts", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Nước hôm nay
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { data: waterRows } = await supa
    .from("water_logs")
    .select("ml, ts")
    .eq("profile_id", user_id)
    .gte("ts", startOfDay.toISOString());

  const water_today_ml =
    waterRows?.reduce((sum: number, r: any) => sum + (r.ml || 0), 0) ?? 0;

  // Bữa gần nhất
  const { data: meal } = await supa
    .from("meal_logs")
    .select("meal_type, text, portion, ts")
    .eq("profile_id", user_id)
    .order("ts", { ascending: false })
    .limit(1)
    .maybeSingle();

  const last_meal = meal
    ? {
        brief: `${meal.meal_type || "bữa"}: ${(meal.text || "").slice(0, 60)}${
          (meal.text || "").length > 60 ? "…" : ""
        } (portion: ${meal.portion ?? "?"})`,
        ts: meal.ts,
      }
    : null;

  // Weight gần nhất
  const { data: w } = await supa
    .from("weight_logs")
    .select("kg, ts")
    .eq("profile_id", user_id)
    .order("ts", { ascending: false })
    .limit(1)
    .maybeSingle();

  // BP gần nhất
  const { data: bp } = await supa
    .from("bp_logs")
    .select("systolic, diastolic, ts")
    .eq("profile_id", user_id)
    .order("ts", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Streak BG (ngày có log liên tiếp)
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const { data: bg30 } = await supa
    .from("glucose_logs")
    .select("ts")
    .eq("profile_id", user_id)
    .gte("ts", since.toISOString());

  const days = new Set(
    (bg30 ?? []).map((r: any) => new Date(r.ts).toISOString().slice(0, 10))
  );
  // đếm lùi từ hôm nay
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (days.has(key)) streak++;
    else break;
  }

  return {
    bg_latest: bg
      ? { value: bg.value, unit: bg.unit || "mg/dL", time_ago: timeAgo(bg.ts) }
      : undefined,
    water_today_ml,
    last_meal,
    weight_latest: w ? { kg: w.kg, ts: w.ts } : null,
    bp_latest: bp ? { systolic: bp.systolic, diastolic: bp.diastolic, ts: bp.ts } : null,
    streaks: { bg_days: streak },
    tz: "Asia/Bangkok",
  };
}
