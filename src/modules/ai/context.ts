import { supabaseAdmin } from '@/lib/supabase/admin'; // Đã sửa import
import type { AIContext, MetricPoint, BPPoint } from './types';

// New compressed context type for token optimization
export type CompressedAIContext = {
  bg?: { latest: number; avg7d?: number; trend?: "up" | "down" | "flat" };
  water?: { latestMl: number; avg7dMl?: number; trend?: "up" | "down" | "flat" };
  weight?: { latestKg: number; avg7dKg?: number; trend?: "up" | "down" | "flat" };
  bp?: { latest: { sys: number; dia: number }; avg7d?: { sys: number; dia: number }; trend?: "up" | "down" | "flat" };
  meal?: { lastMeal: string; lastPortion?: string };
  notes?: string[];
};

export type { AIContext } from './types';

// Cache cho context - 5 phút
const contextCache = new Map<string, { data: AIContext; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

/**
 * Đọc dữ liệu 7 ngày gần nhất của user để build context cho AI
 * Cache 5 phút để tránh query liên tục
 */
export async function buildContext(userId: string): Promise<AIContext> {
  // Kiểm tra cache
  const cached = contextCache.get(userId);
  if (cached && Date.now() < cached.expires) {
    return cached.data;
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  try {
    // Đọc song song tất cả logs 7 ngày
    const [glucoseData, waterData, weightData, bpData, insulinData] = await Promise.all([
      // Glucose logs - map cột chuẩn
      supabaseAdmin() // Gọi supabaseAdmin như một hàm
        .from('glucose_logs')
        .select('value_mgdl, taken_at')
        .eq('user_id', userId)
        .gte('taken_at', sevenDaysAgo.toISOString())
        .order('taken_at', { ascending: false }),

      // Water logs - map cột chuẩn  
      supabaseAdmin() // Gọi supabaseAdmin như một hàm
        .from('water_logs')
        .select('amount_ml, taken_at')
        .eq('user_id', userId)
        .gte('taken_at', sevenDaysAgo.toISOString())
        .order('taken_at', { ascending: false }),

      // Weight logs - map cột chuẩn
      supabaseAdmin() // Gọi supabaseAdmin như một hàm
        .from('weight_logs')
        .select('weight_kg, taken_at')
        .eq('user_id', userId)
        .gte('taken_at', sevenDaysAgo.toISOString())
        .order('taken_at', { ascending: false }),

      // BP logs - map cột chuẩn
      supabaseAdmin() // Gọi supabaseAdmin như một hàm
        .from('bp_logs')
        .select('systolic, diastolic, taken_at')
        .eq('user_id', userId)
        .gte('taken_at', sevenDaysAgo.toISOString())
        .order('taken_at', { ascending: false }),

      // Insulin logs - map cột chuẩn
      supabaseAdmin() // Gọi supabaseAdmin như một hàm
        .from('insulin_logs')
        .select('dose_units, taken_at')
        .eq('user_id', userId)
        .gte('taken_at', sevenDaysAgo.toISOString())
        .order('taken_at', { ascending: false })
    ]);

    // Xử lý glucose
    const glucoseLogs = glucoseData.data || [];
    const bg: MetricPoint[] = glucoseLogs.map(log => ({
      ts: log.taken_at,
      value: log.value_mgdl
    }));

    // Xử lý water
    const waterLogs = waterData.data || [];
    const water: MetricPoint[] = waterLogs.map(log => ({
      ts: log.taken_at,
      value: log.amount_ml
    }));

    // Xử lý weight
    const weightLogs = weightData.data || [];
    const weight: MetricPoint[] = weightLogs.map(log => ({
      ts: log.taken_at,
      value: log.weight_kg
    }));

    // Xử lý BP
    const bpLogs = bpData.data || [];
    const bp: BPPoint[] = bpLogs.map(log => ({
      ts: log.taken_at,
      sys: log.systolic,
      dia: log.diastolic
    }));

    // Xử lý insulin
    const insulinLogs = insulinData.data || [];
    const insulin: MetricPoint[] = insulinLogs.map(log => ({
      ts: log.taken_at,
      value: log.dose_units
    }));

    // Latest values
    const latest = {
      bg: bg[0]?.value,
      bp: bp[0] ? { sys: bp[0].sys, dia: bp[0].dia } : undefined,
      weight: weight[0]?.value
    };

    // Tạo summary
    const summaryParts: string[] = [];
    if (latest.bg) summaryParts.push(`BG gần nhất: ${latest.bg} mg/dL`);
    if (latest.bp) summaryParts.push(`BP: ${latest.bp.sys}/${latest.bp.dia} mmHg`);
    if (latest.weight) summaryParts.push(`Cân nặng: ${latest.weight} kg`);
    
    const totalLogs = bg.length + water.length + weight.length + bp.length + insulin.length;
    summaryParts.push(`${totalLogs} bản ghi trong 7 ngày`);
    
    if (water.length > 0) {
      const avgWater = water.reduce((sum, w) => sum + w.value, 0) / 7;
      summaryParts.push(`Nước TB: ${Math.round(avgWater)}ml/ngày`);
    }

    const summary = summaryParts.join('. ') + '.';

    const context: AIContext = {
      userId,
      windowDays: 7,
      summary,
      metrics: { bg, water, weight, bp, insulin, latest }
    };

    // Lưu cache
    contextCache.set(userId, {
      data: context,
      expires: Date.now() + CACHE_TTL
    });

    return context;

  } catch (error) {
    console.error('Error building user context:', error);
    
    // Fallback context khi lỗi
    return {
      userId,
      windowDays: 7,
      summary: 'Không thể tải dữ liệu người dùng. Vui lòng thử lại sau.',
      metrics: {
        bg: [],
        water: [],
        weight: [],
        bp: [],
        insulin: [],
        latest: {}
      }
    };
  }
}

// Helper to calculate average and trend
function calculateMetricStats(values: number[], latestValue?: number): { avg7d?: number; trend?: "up" | "down" | "flat" } {
  if (values.length === 0) return {};
  const sum = values.reduce((a, b) => a + b, 0);
  const avg7d = Math.round(sum / values.length);

  if (latestValue === undefined) return { avg7d };

  const diff = latestValue - avg7d;
  if (diff > avg7d * 0.05) return { avg7d, trend: "up" }; // > 5% increase
  if (diff < -avg7d * 0.05) return { avg7d, trend: "down" }; // > 5% decrease
  return { avg7d, trend: "flat" };
}

/**
 * Compressed context builder - reduces token usage by 60-70%
 * Returns only essential metrics: latest values, 7d averages, trends
 */
export async function buildCompressedContext(userId: string): Promise<CompressedAIContext> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const context: CompressedAIContext = {};

  try {
    // Fetch all relevant logs for the last 7 days
    const [glucoseRes, waterRes, weightRes, bpRes, mealRes] = await Promise.all([
      supabaseAdmin().from('glucose_logs').select('value_mgdl, taken_at').eq('user_id', userId).gte('taken_at', sevenDaysAgo.toISOString()).order('taken_at', { ascending: false }),
      supabaseAdmin().from('water_logs').select('amount_ml, taken_at').eq('user_id', userId).gte('taken_at', sevenDaysAgo.toISOString()).order('taken_at', { ascending: false }),
      supabaseAdmin().from('weight_logs').select('weight_kg, taken_at').eq('user_id', userId).gte('taken_at', sevenDaysAgo.toISOString()).order('taken_at', { ascending: false }),
      supabaseAdmin().from('bp_logs').select('systolic, diastolic, taken_at').eq('user_id', userId).gte('taken_at', sevenDaysAgo.toISOString()).order('taken_at', { ascending: false }),
      supabaseAdmin().from('meal_logs').select('items, taken_at').eq('user_id', userId).order('taken_at', { ascending: false }).limit(1)
    ]);

    // Glucose - compressed
    const glucoseLogs = glucoseRes.data || [];
    if (glucoseLogs.length > 0) {
      const latest = glucoseLogs[0].value_mgdl;
      const values = glucoseLogs.map(l => l.value_mgdl);
      const { avg7d, trend } = calculateMetricStats(values, latest);
      context.bg = { latest, avg7d, trend };
    }

    // Water - compressed
    const waterLogs = waterRes.data || [];
    if (waterLogs.length > 0) {
      const latestMl = waterLogs[0].amount_ml;
      const values = waterLogs.map(l => l.amount_ml);
      const { avg7d, trend } = calculateMetricStats(values, latestMl);
      context.water = { latestMl, avg7dMl: avg7d, trend };
    }

    // Weight - compressed
    const weightLogs = weightRes.data || [];
    if (weightLogs.length > 0) {
      const latestKg = weightLogs[0].weight_kg;
      const values = weightLogs.map(l => l.weight_kg);
      const { avg7d, trend } = calculateMetricStats(values, latestKg);
      context.weight = { latestKg, avg7dKg: avg7d, trend };
    }

    // Blood Pressure - compressed
    const bpLogs = bpRes.data || [];
    if (bpLogs.length > 0) {
      const latest = { sys: bpLogs[0].systolic, dia: bpLogs[0].diastolic };
      const sysValues = bpLogs.map(l => l.systolic);
      const diaValues = bpLogs.map(l => l.diastolic);
      const { avg7d: avgSys, trend: trendSys } = calculateMetricStats(sysValues, latest.sys);
      const { avg7d: avgDia, trend: trendDia } = calculateMetricStats(diaValues, latest.dia);
      context.bp = {
        latest,
        avg7d: avgSys && avgDia ? { sys: avgSys, dia: avgDia } : undefined,
        trend: trendSys === trendDia ? trendSys : undefined
      };
    }

    // Meal - compressed
    const mealLog = mealRes.data?.[0];
    if (mealLog && mealLog.items && Array.isArray(mealLog.items) && mealLog.items.length > 0) {
      context.meal = {
        lastMeal: mealLog.items[0]?.name || "Unknown meal"
      };
    }

  } catch (error) {
    console.error("Error building compressed context:", error);
    // Graceful degradation - return empty context, don't crash
  }

  return context;
}
