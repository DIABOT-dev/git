import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin"; // Đã sửa import
import { getUserId } from "@/lib/auth/getUserId";
import { format, startOfDay, endOfDay } from "date-fns";

const bodySchema = z.object({
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), // YYYY-MM-DD
  userId: z.string().uuid().optional(), // For admin/debug
});

export async function POST(req: NextRequest) {
  let userId = await getUserId(req);
  
  const json = await req.json().catch(() => ({}));
  const parse = bodySchema.safeParse(json);
  if (!parse.success) return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });

  const { day, userId: paramUserId } = parse.data;
  
  // Allow admin override for ETL
  if (paramUserId && !userId) userId = paramUserId;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const targetDay = day || format(new Date(), 'yyyy-MM-dd');
  const startTime = startOfDay(new Date(targetDay)).toISOString();
  const endTime = endOfDay(new Date(targetDay)).toISOString();

  const sb = supabaseAdmin; // Gọi supabaseAdmin như một hàm

  try {
    // Aggregate glucose data
    const { data: glucoseLogs } = await sb
      .from("glucose_logs")
      .select("value_mgdl")
      .eq("user_id", userId)
      .gte("taken_at", startTime)
      .lte("taken_at", endTime);

    if (glucoseLogs && glucoseLogs.length > 0) {
      const values = glucoseLogs.map(log => log.value_mgdl);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      await sb.from("metrics_day").upsert({
        user_id: userId,
        day: targetDay,
        metric: "bg_avg",
        value: { avg: Math.round(avg), min, max, count: values.length },
        updated_at: new Date().toISOString()
      });
    }

    // Aggregate water data
    const { data: waterLogs } = await sb
      .from("water_logs")
      .select("amount_ml")
      .eq("user_id", userId)
      .gte("taken_at", startTime)
      .lte("taken_at", endTime);

    if (waterLogs && waterLogs.length > 0) {
      const total = waterLogs.reduce((sum, log) => sum + log.amount_ml, 0);
      await sb.from("metrics_day").upsert({
        user_id: userId,
        day: targetDay,
        metric: "water_total",
        value: { total_ml: total, count: waterLogs.length },
        updated_at: new Date().toISOString()
      });
    }

    return NextResponse.json({ 
      ok: true, 
      userId, 
      day: targetDay,
      processed: {
        glucose: glucoseLogs?.length || 0,
        water: waterLogs?.length || 0
      }
    });

  } catch (error: any) {
    console.error("ETL Daily error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Export class for imports
export class GlucoseLogsRepo {
  async listByRange(userId: string, startTime: string, endTime: string) {
    const sb = supabaseAdmin; // Gọi supabaseAdmin như một hàm
    const { data, error } = await sb
      .from("glucose_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("taken_at", startTime)
      .lte("taken_at", endTime)
      .order("taken_at", { ascending: false });
    
    if (error) throw new Error(`Failed to get glucose logs: ${error.message}`);
    return data || [];
  }

  async create(log: any) {
    const sb = supabaseAdmin; // Gọi supabaseAdmin như một hàm
    const { data, error } = await sb
      .from("glucose_logs")
      .insert(log)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create glucose log: ${error.message}`);
    return data;
  }
}
