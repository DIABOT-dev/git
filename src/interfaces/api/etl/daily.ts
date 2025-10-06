import { NextResponse } from "next/server";
import { ETLDailyInput } from "@/interfaces/api/validators";
import { MetricsRepo } from "@/infrastructure/repositories/MetricsRepo";
import { GlucoseLogsRepo } from "@/infrastructure/repositories/GlucoseLogsRepo";
import { requireAuth } from "@/lib/auth/getUserId";
import { format, startOfDay, endOfDay } from "date-fns";

export async function handlePost(req: Request) {
  try {
    const body = await req.json();
    const { day, userId: paramUserId } = ETLDailyInput.parse(body);
    
    // Use authenticated user or parameter (for admin/demo)
    let userId: string;
    try {
      userId = await requireAuth();
    } catch {
      if (paramUserId) {
        userId = paramUserId;
      } else {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
    }

    const targetDay = day || format(new Date(), 'yyyy-MM-dd');
    const startTime = startOfDay(new Date(targetDay)).toISOString();
    const endTime = endOfDay(new Date(targetDay)).toISOString();

    // Get repositories
    const metricsRepo = new MetricsRepo();
    const glucoseRepo = new GlucoseLogsRepo();

    // Calculate daily metrics
    const glucoseLogs = await glucoseRepo.listByRange(userId, startTime, endTime);
    
    if (glucoseLogs.length > 0) {
      const values = glucoseLogs.map(log => log.value_mgdl);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      await metricsRepo.upsertDailyMetric(userId, targetDay, 'bg_avg', {
        avg: Math.round(avg),
        min,
        max,
        count: values.length
      });
    }

    return NextResponse.json({ 
      success: true, 
      userId, 
      day: targetDay,
      processed: glucoseLogs.length 
    });
  } catch (error: any) {
    console.error('ETL Daily error:', error);
    return NextResponse.json(
      { error: error.message || 'ETL processing failed' },
      { status: 500 }
    );
  }
}