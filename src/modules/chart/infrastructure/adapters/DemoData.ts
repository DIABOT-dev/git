import { ChartDay, ChartVM, TimelineItem, TimelineVM } from "../../domain/types";

function addDays(base: Date, d: number) {
  const x = new Date(base);
  x.setDate(x.getDate() + d);
  return x;
}
function fmtDate(d: Date) {
  const z = new Date(d); z.setHours(0,0,0,0);
  return z.toISOString().slice(0, 10);
}
function makeDates(range: "7d" | "30d"): string[] {
  const today = new Date();
  const start = new Date(today);
  start.setHours(0,0,0,0);
  if (range === "7d") start.setDate(start.getDate() - 6);
  else start.setDate(start.getDate() - 29);
  const days: string[] = [];
  const len = range === "7d" ? 7 : 30;
  for (let i=0; i<len; i++) days.push(fmtDate(addDays(start, i)));
  return days;
}

export function buildDemoChartVM(range: "7d" | "30d"): ChartVM {
  const dates = makeDates(range);
  const days: ChartDay[] = dates.map((date, i) => {
    return {
      date,
      bg_avg: 110 + (i%5),
      bp_sys_avg: 120 + (i%3),
      bp_dia_avg: 80 + (i%2),
      weight_kg: 67 + (i%4)*0.1,
      water_ml: 1800 + (i%5)*100,
      insulin_units: 10 + (i%3),
      meals_count: 3 + (i%2),
    };
  });
  return { days, kpi: {} as any };
}

export function buildDemoTimelineVM(range: "7d" | "30d"): TimelineVM {
  const dates = makeDates(range);
  const items: TimelineItem[] = [];
  dates.forEach((date, i) => {
    items.push({ ts: `${date}T07:30:00.000Z`, type: "BG", title: "Đo đường huyết", value: 110+i, unit: "mg/dL" });
    items.push({ ts: `${date}T12:00:00.000Z`, type: "Meal", title: "Bữa trưa", value: 1, unit: "meal" });
  });
  return { groups: dates.map(d => ({ date: d, items })), nextCursor: null };
}
