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

  const sb = sbAdmin();

  const [bg, meals, water, weight, bp, insulin] = await Promise.all([
    sb.from("glucose_logs").select("mgdl").gte("at", start).lte("at", end).eq("user_id", userId),
    sb.from("meal_logs").select("id").gte("at", start).lte("at", end).eq("user_id", userId),
    sb.from("water_logs").select("ml").gte("at", start).lte("at", end).eq("user_id", userId),
    sb.from("weight_logs").select("kg, at").gte("at", start).lte("at", end).eq("user_id", userId).order("at",{ascending:false}).limit(1),
    sb.from("bp_logs").select("systolic, diastolic").gte("at", start).lte("at", end).eq("user_id", userId),
    sb.from("insulin_logs").select("units").gte("at", start).lte("at", end).eq("user_id", userId),
  ]);

  const avg = (arr: number[]) => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : null;

  const avg_glucose  = bg.data ? avg(bg.data.map((x:any)=>x.mgdl)) : null;
  const count_meals  = meals.data?.length ?? 0;
  const water_ml     = water.data?.reduce((s:number,x:any)=>s+(x.ml||0),0) ?? 0;
  const last_weight_kg = weight.data?.[0]?.kg ?? null;
  const avg_systolic = bp.data ? avg(bp.data.map((x:any)=>x.systolic)) : null;
  const avg_diastolic= bp.data ? avg(bp.data.map((x:any)=>x.diastolic)) : null;
  const insulin_units= insulin.data?.reduce((s:number,x:any)=>s+(Number(x.units)||0),0) ?? 0;

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
