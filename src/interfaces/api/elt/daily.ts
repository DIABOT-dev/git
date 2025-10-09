import { NextResponse } from "next/server";
import { z } from "zod";
import { admin as sbAdmin } from "@/lib/supabase/admin";

const Input = z.object({
  userId: z.string().uuid(),
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), // YYYY-MM-DD
});

export async function handlePost(req: Request) {
  const { userId, day } = Input.parse(await req.json());
  const targetDay = day ?? new Date().toISOString().slice(0, 10);
  const start = new Date(`${targetDay}T00:00:00.000Z`).toISOString();
  const end   = new Date(`${targetDay}T23:59:59.999Z`).toISOString();

  const sb = sbAdmin;

  const [bg, meals, water, weight, bp, insulin] = await Promise.all([
    sb.from("glucose_logs").select("mgdl").gte("at", start).lte("at", end).eq("user_id", userId),
    sb.from("meal_logs").select("id").gte("at", start).lte("at", end).eq("user_id", userId),
    sb.from("water_logs").select("ml").gte("at", start).lte("at", end).eq("user_id", userId),
    sb.from("weight_logs").select("kg, at").gte("at", start).lte("at", end).eq("user_id", userId).order("at",{ascending:false}).limit(1),
    sb.from("bp_logs").select("systolic, diastolic").gte("at", start).lte("at", end).eq("user_id", userId),
    sb.from("insulin_logs").select("units").gte("at", start).lte("at", end).eq("user_id", userId),
  ]);

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

  const bgRows = ((bg.data ?? []) as Array<{ mgdl: number | null }>);
  const bgValues = bgRows
    .map((row) => (typeof row.mgdl === "number" ? row.mgdl : null))
    .filter((value): value is number => value !== null);
  const avg_glucose = avg(bgValues);

  const count_meals = meals.data?.length ?? 0;

  const waterRows = ((water.data ?? []) as Array<{ ml: number | null }>);
  const water_ml = waterRows.reduce((sum, row) => sum + (typeof row.ml === "number" ? row.ml : 0), 0);

  const weightRows = ((weight.data ?? []) as Array<{ kg: number | null }>);
  const last_weight_kg = weightRows.length ? weightRows[0]?.kg ?? null : null;

  const bpRows = ((bp.data ?? []) as Array<{ systolic: number | null; diastolic: number | null }>);
  const systolicValues = bpRows
    .map((row) => (typeof row.systolic === "number" ? row.systolic : null))
    .filter((value): value is number => value !== null);
  const diastolicValues = bpRows
    .map((row) => (typeof row.diastolic === "number" ? row.diastolic : null))
    .filter((value): value is number => value !== null);
  const avg_systolic = avg(systolicValues);
  const avg_diastolic = avg(diastolicValues);

  const insulinRows = ((insulin.data ?? []) as Array<{ units: number | string | null }>);
  const insulin_units = insulinRows.reduce((sum, row) => {
    if (typeof row.units === "number" && Number.isFinite(row.units)) {
      return sum + row.units;
    }
    if (typeof row.units === "string") {
      const parsed = Number(row.units);
      return Number.isFinite(parsed) ? sum + parsed : sum;
    }
    return sum;
  }, 0);

  const { error } = await sb.from("metrics_day").upsert({
    user_id: userId,
    day: targetDay,
    avg_glucose, count_meals, water_ml, last_weight_kg,
    avg_systolic, avg_diastolic, insulin_units,
    updated_at: new Date().toISOString()
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, userId, day: targetDay }, { status: 200 });
}
