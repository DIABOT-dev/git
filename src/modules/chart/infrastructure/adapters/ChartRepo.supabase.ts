import { createClient } from "@supabase/supabase-js";
import { ChartVM, Metric, RangeOption, TimelineVM, ChartDay, TimelineItem } from "../../domain/types";
import { getFeatureFlag } from "../../../../../config/feature-flags";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Thiếu ENV Supabase. Cần NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY trong .env.local"
  );
}

const sb = createClient(supabaseUrl, supabaseAnonKey);

export interface ChartRepo {
  fetchMetricsDay(range: RangeOption, metrics?: Metric[]): Promise<ChartVM>;
  fetchTimeline(range: RangeOption, metrics?: Metric[], cursor?: string | null): Promise<TimelineVM>;
}

function dateBounds(range: RangeOption) {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const start = new Date(end);
  if (range === "7d") start.setUTCDate(end.getUTCDate() - 6);
  else start.setUTCDate(end.getUTCDate() - 29);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start: fmt(start), end: fmt(end) };
}

export class ChartRepoSupabase implements ChartRepo {
  async fetchMetricsDay(range: RangeOption, metrics?: Metric[]): Promise<ChartVM> {
    if (!getFeatureFlag('CHART_FALLBACK')) return this.readFromChartDB(range, metrics);
    return this.readFromFallbackOLTP(range, metrics);
  }

  async fetchTimeline(range: RangeOption, metrics?: Metric[], cursor?: string | null): Promise<TimelineVM> {
    if (!getFeatureFlag('CHART_FALLBACK')) return this.readTimelineFromChartDB(range, metrics, cursor);
    return this.readTimelineFromFallback(range, metrics, cursor);
  }

  // ── Chart DB (ưu tiên)
  private async readFromChartDB(range: RangeOption, _metrics?: Metric[]): Promise<ChartVM> {
    const { start, end } = dateBounds(range);
    const { data, error } = await sb
      .from("metrics_day")
      .select("day, metric, value")
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: true });
    if (error) throw error;

    const days: ChartDay[] = (data || []).map((d: any) => ({
      date: d.date,
      bg_avg: d.bg_avg ?? undefined,
      bp_sys_avg: d.bp_sys_avg ?? undefined,
      bp_dia_avg: d.bp_dia_avg ?? undefined,
      weight_kg: d.weight_kg ?? undefined,
      water_ml: d.water_ml ?? undefined,
      insulin_units: d.insulin_units ?? undefined,
      meals_count: d.meals_count ?? undefined,
    }));

    const kpi = computeKPI7d(days);
    return { days, kpi };
  }

  private async readTimelineFromChartDB(range: RangeOption, metrics?: Metric[], cursor?: string | null): Promise<TimelineVM> {
    const { start, end } = dateBounds(range);
    const pageSize = 40;
    const from = cursor ? Number(cursor) : 0;
    const to = from + pageSize - 1;

    let q = sb
      .from("metrics_events")
      .select("ts, type, title, value, unit, context, note")
      .gte("ts", `${start}T00:00:00.000Z`)
      .lte("ts", `${end}T23:59:59.999Z`)
      .order("ts", { ascending: false })
      .range(from, to);

    if (metrics && metrics.length) q = q.in("type", metrics);

    const { data, error } = await q;
    if (error) throw error;

    const groups = groupByDay(data || []);
    const nextCursor = (data && data.length === pageSize) ? String(to + 1) : null;
    return { groups, nextCursor };
  }

  // ── Fallback OLTP (sau flag) — demo water + weight; TODO các loại khác
  private async readFromFallbackOLTP(range: RangeOption, _metrics?: Metric[]): Promise<ChartVM> {
    const { start, end } = dateBounds(range);
    const [water, weight] = await Promise.all([
      sb.from("water_logs").select("ts, ml").gte("ts", `${start}T00:00:00Z`).lte("ts", `${end}T23:59:59Z`),
      sb.from("weight_logs").select("ts, kg").gte("ts", `${start}T00:00:00Z`).lte("ts", `${end}T23:59:59Z`),
    ]);
    if (water.error) throw water.error;
    if (weight.error) throw weight.error;

    const daysMap = new Map<string, any>();
    const ensure = (d: string) => {
      if (!daysMap.has(d)) daysMap.set(d, { date: d });
      return daysMap.get(d);
    };

    (water.data || []).forEach((r: any) => {
      const day = r.ts.slice(0, 10);
      const row = ensure(day);
      row.water_ml = (row.water_ml || 0) + (r.ml || 0);
    });
    (weight.data || []).forEach((r: any) => {
      const day = r.ts.slice(0, 10);
      const row = ensure(day);
      row.weight_kg = r.kg || row.weight_kg;
    });

    const days = Array.from(daysMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    const kpi = computeKPI7d(days);
    return { days, kpi };
  }

  private async readTimelineFromFallback(range: RangeOption, metrics?: Metric[], cursor?: string | null): Promise<TimelineVM> {
    const { start, end } = dateBounds(range);
    const pageSize = 40;
    const from = cursor ? Number(cursor) : 0;
    const to = from + pageSize - 1;

    const res = await sb
      .from("water_logs")
      .select("ts, ml")
      .gte("ts", `${start}T00:00:00Z`)
      .lte("ts", `${end}T23:59:59Z`)
      .order("ts", { ascending: false })
      .range(from, to);

    if (res.error) throw res.error;

    const items: TimelineItem[] = (res.data || []).map((r: any) => ({
      ts: r.ts,
      type: "Water",
      title: "Uống nước",
      value: r.ml,
      unit: "ml",
    }));

    const groups = groupByDay(items);
    const nextCursor = (items.length === pageSize) ? String(to + 1) : null;
    return { groups, nextCursor };
  }
}

// Helpers
function computeKPI7d(days: ChartDay[]) {
  const last7 = days.slice(-7);
  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  const avg = (arr: number[]) => (arr.length ? sum(arr) / arr.length : undefined);

  const kpi = {
    bg_avg_7d: avg(last7.map(d => d.bg_avg!).filter(Boolean as any)),
    bp_sys_avg_7d: avg(last7.map(d => d.bp_sys_avg!).filter(Boolean as any)),
    bp_dia_avg_7d: avg(last7.map(d => d.bp_dia_avg!).filter(Boolean as any)),
    weight_current: [...last7].reverse().find(d => d.weight_kg !== undefined)?.weight_kg,
    weight_delta_7d: undefined as number | undefined,
    water_ml_avg_7d: avg(last7.map(d => d.water_ml!).filter(Boolean as any)),
    insulin_units_sum_7d: sum(last7.map(d => d.insulin_units || 0)),
    meal_count_avg_7d: avg(last7.map(d => d.meals_count!).filter(Boolean as any)),
    bg_days_above_target_pct: null, // TODO khi có ngưỡng
  } as any;

  // weight delta (current vs 7 days before if exists)
  if (days.length >= 8) {
    const current = days[days.length - 1].weight_kg;
    const prev = days[days.length - 8].weight_kg;
    if (current !== undefined && prev !== undefined) kpi.weight_delta_7d = Number((current - prev).toFixed(1));
  }
  return kpi;
}

function groupByDay(items: any[]) {
  const groups: Record<string, any[]> = {};
  for (const it of items) {
    const day = (it.ts || it.date).slice(0, 10);
    groups[day] = groups[day] || [];
    groups[day].push(it);
  }
  return Object.keys(groups)
    .sort((a, b) => b.localeCompare(a))
    .map(date => ({ date, items: groups[date] }));
}
