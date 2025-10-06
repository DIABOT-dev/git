// src/app/api/etl/daily/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin"; // Đã sửa import
import { getUserId } from "@/lib/auth/getUserId";
import { format, startOfDay, endOfDay } from "date-fns";

// ✅ để Next không cố prerender / không tĩnh hoá
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

const bodySchema = z.object({
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), // YYYY-MM-DD
  userId: z.string().uuid().optional(), // allow admin/debug override
});

export async function POST(req: NextRequest) {
  try {
    // Lấy userId từ session/cookie
    let effectiveUserId = await getUserId(req);

    // Parse body an toàn
    const json = await req.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { day, userId: overrideUserId } = parsed.data;

    // Cho phép override khi không có session (dùng cho admin/cron)
    if (overrideUserId && !effectiveUserId) effectiveUserId = overrideUserId;
    if (!effectiveUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Khoảng ngày
    const targetDay = day || format(new Date(), "yyyy-MM-dd");
    const startTime = startOfDay(new Date(targetDay)).toISOString();
    const endTime = endOfDay(new Date(targetDay)).toISOString();

    // Khởi tạo client trong handler (tránh side-effect top-level)
    const sb = supabaseAdmin(); // Gọi supabaseAdmin như một hàm

    // ---------- Aggregate glucose ----------
    let glucoseProcessed = 0;
    {
      const { data: glucoseLogs, error } = await sb
        .from("glucose_logs")
        .select("value_mgdl")
        .eq("user_id", effectiveUserId)
        .gte("taken_at", startTime)
        .lte("taken_at", endTime);

      if (error) {
        console.error("Supabase glucose select error:", error);
      } else if (glucoseLogs && glucoseLogs.length) {
        const values = glucoseLogs.map((x) => x.value_mgdl);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        glucoseProcessed = values.length;

        const { error: upsertErr } = await sb.from("metrics_day").upsert({
          user_id: effectiveUserId,
          day: targetDay,
          metric: "bg_avg",
          value: { avg: Math.round(avg), min, max, count: values.length },
          updated_at: new Date().toISOString(),
        });
        if (upsertErr) console.error("metrics_day upsert (bg_avg) error:", upsertErr);
      }
    }

    // ---------- Aggregate water ----------
    let waterProcessed = 0;
    {
      const { data: waterLogs, error } = await sb
        .from("water_logs")
        .select("amount_ml")
        .eq("user_id", effectiveUserId)
        .gte("taken_at", startTime)
        .lte("taken_at", endTime);

      if (error) {
        console.error("Supabase water select error:", error);
      } else if (waterLogs && waterLogs.length) {
        const total = waterLogs.reduce((sum, x) => sum + x.amount_ml, 0);
        waterProcessed = waterLogs.length;

        const { error: upsertErr } = await sb.from("metrics_day").upsert({
          user_id: effectiveUserId,
          day: targetDay,
          metric: "water_total",
          value: { total_ml: total, count: waterLogs.length },
          updated_at: new Date().toISOString(),
        });
        if (upsertErr) console.error("metrics_day upsert (water_total) error:", upsertErr);
      }
    }

    return NextResponse.json({
      ok: true,
      userId: effectiveUserId,
      day: targetDay,
      processed: { glucose: glucoseProcessed, water: waterProcessed },
    });
  } catch (err: any) {
    console.error("ETL Daily error:", err);
    return NextResponse.json({ error: err?.message ?? "Internal error" }, { status: 500 });
  }
}

// Optional: GET để health-check nhanh (không ảnh hưởng build)
export async function GET() {
  return NextResponse.json({ ok: true });
}
