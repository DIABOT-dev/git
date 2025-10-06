import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin"; // Đã sửa import
import { requireAuth } from "@/lib/auth/getUserId";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

const querySchema = z.object({
  range: z.enum(["7d", "30d"]).default("7d"),
});

/**
 * Get week start dates (YYYY-MM-DD) for the given range, in Bangkok timezone.
 * Week starts on Monday.
 */
function getWeekStartDatesForRange(range: "7d" | "30d"): string[] {
  const now = new Date();
  const weekStarts: string[] = [];
  const numWeeks = range === "7d" ? 2 : 4; // Get current week and previous weeks

  for (let i = 0; i < numWeeks; i++) {
    const date = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
    // Calculate the Monday of the week for the given date (in Bangkok timezone)
    const bangkokDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
    const monday = new Date(bangkokDate);
    monday.setDate(bangkokDate.getDate() - ((bangkokDate.getDay() + 6) % 7)); // Adjust to Monday
    weekStarts.push(monday.toISOString().split('T')[0]); // YYYY-MM-DD
  }
  // Ensure unique dates and sort them for consistent querying
  return Array.from(new Set(weekStarts)).sort();
}

export async function GET(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    
    const { searchParams } = new URL(req.url);
    const parseResult = querySchema.safeParse({
      range: searchParams.get("range") || "7d"
    });
    
    if (!parseResult.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid query parameters", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }
    
    const { range } = parseResult.data;
    const weekStarts = getWeekStartDatesForRange(range); // Use new function
    
    console.log(`[Meal Chart] userId=${userId} range=${range} weekStarts=${weekStarts.join(',')}`);
    
    // Query cache_meal_week for the specified week_start dates
    const { data: cacheData, error: cacheError } = await supabaseAdmin() // Gọi supabaseAdmin như một hàm
      .from('cache_meal_week')
      .select('week_start, summary') // Select week_start instead of week
      .eq('profile_id', userId)
      .in('week_start', weekStarts) // Filter by week_start
      .order('week_start', { ascending: false }); // Order by week_start
    
    if (cacheError) {
      console.error(`[Meal Chart] Cache query error: ${cacheError.message}`);
      return NextResponse.json(
        { ok: false, error: "Database error", message: "Failed to fetch meal cache data" },
        { status: 500 }
      );
    }
    
    // Transform cache data to chart format
    const chartData = (cacheData || []).map(row => ({
      week_start: row.week_start, // Use week_start
      week_label: row.summary?.week_label || `Week starting ${row.week_start}`, // Use week_start for fallback label
      total_meals: row.summary?.total_meals || 0,
      kcal_est: row.summary?.kcal_est || 0,
      carb_g_est: row.summary?.carb_g_est || 0,
      top_foods: row.summary?.top_foods || [],
      week_start_iso: row.summary?.week_start || null // Keep original week_start from summary if needed
    }));
    
    console.log(`[Meal Chart] Returning ${chartData.length} weeks of data`);
    
    return NextResponse.json({
      ok: true,
      data: chartData,
      meta: {
        range,
        week_starts_requested: weekStarts.length,
        weeks_found: chartData.length,
        timezone: "Asia/Bangkok"
      }
    }, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
    
  } catch (error: any) {
    if (error.message === "Authentication required") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    
    console.error("[Meal Chart] Unexpected error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
