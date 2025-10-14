import { NextResponse } from "next/server";

// Mock or replace with real adapter; session/profile_id to be wired in auth step
const demoSeries = [
  { day: "2025-10-08", bg: 120, water: 2000, weight: 68.5 },
  { day: "2025-10-09", bg: 135, water: 1800, weight: 68.2 },
  { day: "2025-10-10", bg: 110, water: 1600, weight: 68.1 },
  { day: "2025-10-11", bg: 140, water: 1900, weight: 68.0 },
  { day: "2025-10-12", bg: 115, water: 2100, weight: 67.8 },
  { day: "2025-10-13", bg: 128, water: 2000, weight: 67.9 },
  { day: "2025-10-14", bg: 125, water: 1950, weight: 67.7 },
];

// Calculate summary (demo logic)
function calcSummary(series: typeof demoSeries) {
  const days = series.length;
  const avgBg = Math.round(series.reduce((a, b) => a + b.bg, 0) / days);
  const avgWater = Math.round(series.reduce((a, b) => a + b.water, 0) / days);
  const avgWeight = +(series.reduce((a, b) => a + b.weight, 0) / days).toFixed(1);
  return { avgBg, avgWater, avgWeight, days };
}

export async function GET(request: Request) {
  // TODO: Replace with real DB adapter when available
  // For now, always return demo
  const series = demoSeries;
  const summary = calcSummary(series);

  return NextResponse.json({
    series,
    summary,
    range: "7d",
    fallback: true,
  }, { status: 200 });
}