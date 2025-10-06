import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/getUserId";
import { buildDemoChartVM } from "@/modules/chart/infrastructure/adapters/DemoData";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    // Require authentication
    await requireAuth(req);

    // Always return 200 with fallback data
    const demo7d = buildDemoChartVM("7d");
    const demo30d = buildDemoChartVM("30d");

    // Convert to series format expected by spec
    const series7 = demo7d.days.map(day => ({
      date: day.date,
      bg_avg: day.bg_avg,
      bp_sys_avg: day.bp_sys_avg,
      bp_dia_avg: day.bp_dia_avg,
      weight_kg: day.weight_kg,
      water_ml: day.water_ml,
      insulin_units: day.insulin_units,
      meals_count: day.meals_count
    }));

    const series30 = demo30d.days.map(day => ({
      date: day.date,
      bg_avg: day.bg_avg,
      bp_sys_avg: day.bp_sys_avg,
      bp_dia_avg: day.bp_dia_avg,
      weight_kg: day.weight_kg,
      water_ml: day.water_ml,
      insulin_units: day.insulin_units,
      meals_count: day.meals_count
    }));

    // Determine source based on Supabase availability
    let source = "demo";
    const hasSupabaseEnv = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (hasSupabaseEnv) {
      try {
        // Try to connect to Supabase to see if it's available
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Test connection with a simple query
        const { error } = await supabase.from("profiles").select("id").limit(1);
        if (!error) {
          source = "supabase";
        }
      } catch (e) {
        // If Supabase connection fails, keep source as "demo"
        console.warn("Supabase connection failed, using demo data:", e);
      }
    }

    return NextResponse.json({
      series7,
      series30,
      source
    }, {
      status: 200,
      headers: { "Cache-Control": "no-store" }
    });

  } catch (error: any) {
    if (error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Even on error, return 200 with demo data as per spec
    console.error("Error in /api/chart/fallback:", error);

    const demo7d = buildDemoChartVM("7d");
    const demo30d = buildDemoChartVM("30d");

    return NextResponse.json({
      series7: demo7d.days,
      series30: demo30d.days,
      source: "demo"
    }, {
      status: 200,
      headers: { "Cache-Control": "no-store" }
    });
  }
}