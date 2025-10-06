import { supabaseAdmin } from "@/lib/supabase/admin"; // Đã sửa import

/**
 * Rule:
 * - BG >72h → push coach_events
 * - Water < target (mặc định 1500ml) → push
 * - Weight 7d lệch > ngưỡng (mặc định 1.5kg) → push
 */
export async function runCoachTriggers(user_id: string, opts?: { waterTarget?: number; weightDelta?: number }) {
  const supa = supabaseAdmin(); // Gọi supabaseAdmin như một hàm
  const waterTarget = opts?.waterTarget ?? 1500;
  const weightDelta = opts?.weightDelta ?? 1.5;

  // BG near
  const { data: bg } = await supa
    .from("glucose_logs")
    .select("ts")
    .eq("profile_id", user_id)
    .order("ts", { ascending: false })
    .limit(1)
    .maybeSingle();

  const needBG =
    !bg || Date.now() - new Date(bg.ts).getTime() > 72 * 3600 * 1000;

  if (needBG) {
    await supa.from("coach_events").insert({
      user_id,
      event_type: "bg_over_72h",
      payload: { msg: "Đã quá 72h chưa đo BG, hãy đo lại ngay." },
    });
  }

  // Water today
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const { data: waters } = await supa
    .from("water_logs")
    .select("ml")
    .eq("profile_id", user_id)
    .gte("ts", start.toISOString());

  const waterSum = (waters ?? []).reduce((s: number, r: any) => s + (r.ml || 0), 0);
  if (waterSum < waterTarget) {
    await supa.from("coach_events").insert({
      user_id,
      event_type: "water_below_target",
      payload: { today_ml: waterSum, target_ml: waterTarget },
    });
  }

  // Weight delta 7d
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const { data: w7 } = await supa
    .from("weight_logs")
    .select("kg, ts")
    .eq("profile_id", user_id)
    .gte("ts", since.toISOString())
    .order("ts", { ascending: false });

  if (w7 && w7.length >= 2) {
    const latest = w7[0].kg;
    const oldest = w7[w7.length - 1].kg;
    if (Math.abs(latest - oldest) > weightDelta) {
      await supa.from("coach_events").insert({
        user_id,
        event_type: "weight_delta_7d",
        payload: { latest, oldest, delta: latest - oldest },
      });
    }
  }
}
