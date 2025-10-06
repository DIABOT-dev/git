export type RangeOption = "7d" | "30d";
export type Metric = "BG" | "BP" | "Weight" | "Water" | "Insulin" | "Meal";

export interface ChartDay {
  date: string; // yyyy-mm-dd, TZ Asia/Bangkok
  bg_avg?: number;
  bp_sys_avg?: number;
  bp_dia_avg?: number;
  weight_kg?: number;
  water_ml?: number;
  insulin_units?: number;
  insulin_units_avg_daily?: number;
  meals_count?: number;
}

export interface KPI {
  bg_avg_7d?: number;
  bg_days_above_target_pct?: number | null;
  bp_sys_avg_7d?: number;
  bp_dia_avg_7d?: number;
  weight_current?: number;
  weight_delta_7d?: number;
  water_ml_avg_7d?: number;
  insulin_units_sum_7d?: number;
  insulin_units_avg_daily?: number;
  meal_count_avg_7d?: number;
}

export interface ChartVM {
  days: ChartDay[];
  kpi: KPI;
}

export interface TimelineItem {
  ts: string;       // ISO datetime
  type: Metric;
  title: string;
  value: number | string;
  unit?: string;
  context?: string;
  note?: string;
}

export interface TimelineGroup {
  date: string; // yyyy-mm-dd
  items: TimelineItem[];
}

export interface TimelineVM {
  groups: TimelineGroup[];
  nextCursor?: string | null;
}

export interface SnapshotVM {
  avg_bg?: number | null;
  total_water?: number | null;
  weight_last?: number | null;
  bp_recent?: { s: number; d: number; ts: string } | null;
}
