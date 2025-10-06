import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";

const ChartQueryInput = z.object({
  metric: z.enum(["avg_bg", "total_water", "weight", "bp", "meals"]),
  range: z.enum(["7d", "30d"]).default("7d"),
  userId: z.string().min(1, "userId required"),
});

type MetricDayRow = {
  profile_id: string;
  date: string; // YYYY-MM-DD
  avg_bg?: number | null;
  total_water?: number | null;
  weight?: number | null;
  bp_systolic?: number | null;
  bp_diastolic?: number | null;
  meals?: number | null;
};

export async function handleGet(req: Request, metric: string) {
  try {
    const { searchParams } = new URL(req.url);
    const range = ((searchParams.get("range") as "7d" | "30d") || "7d") as any;
    const userId = searchParams.get("userId") || "";

    const query = ChartQueryInput.parse({ metric, range, userId });

    const days = query.range === "30d" ? 30 : 7;
    const sinceISO = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("metrics_day")
      .select(
        "profile_id,date,avg_bg,total_water,weight,bp_systolic,bp_diastolic,meals"
      )
      .eq("profile_id", query.userId)
      .gte("date", sinceISO.split("T")[0])
      .order("date", { ascending: true });

    if (error) {
      return NextResponse.json(
        { ok: false, error: "DB_ERROR", message: error.message },
        { status: 500 }
      );
    }

    const rows = (data ?? []).map((r: any) => {
      switch (query.metric) {
        case "avg_bg":
          return { date: r.date, value: r.avg_bg ?? null };
        case "total_water":
          return { date: r.date, value: r.total_water ?? null };
        case "weight":
          return { date: r.date, value: r.weight ?? null };
        case "bp":
          return {
            date: r.date,
            s: r.bp_systolic ?? null,
            d: r.bp_diastolic ?? null,
          };
        case "meals":
          return { date: r.date, value: r.meals ?? null };
      }
    });

    return NextResponse.json({
      ok: true,
      metric: query.metric,
      range: query.range,
      userId: query.userId,
      rows,
    });
  } catch (error: any) {
    const message =
      error?.issues?.[0]?.message ||
      error?.message ||
      "Invalid request or internal error";
    const status = error?.name === "ZodError" ? 400 : 500;

    return NextResponse.json(
      { ok: false, error: status === 400 ? "BAD_REQUEST" : "INTERNAL_ERROR", message },
      { status }
    );
  }
}