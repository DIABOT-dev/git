import { ChartVM } from "../../domain/types";
import { FetchChartData } from "./FetchChartData";

// Dùng cho AI (hoặc nơi khác) — không phụ thuộc UI
export async function GetUserMetricsSnapshot(range: "7d" | "30d" = "7d"): Promise<ChartVM> {
  const vm = await FetchChartData(range);
  return vm;
}
