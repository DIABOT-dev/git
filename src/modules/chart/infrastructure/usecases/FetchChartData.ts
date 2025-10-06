import { ChartVM, Metric, RangeOption } from "../../domain/types";
import { ChartRepoSupabase } from "../../infrastructure/adapters/ChartRepo.supabase";
import { buildDemoChartVM } from "../../infrastructure/adapters/DemoData";
import { getFeatureFlag } from "../../../../../config/feature-flags";

const repo = new ChartRepoSupabase();

export async function FetchChartData(range: RangeOption, metrics?: Metric[]): Promise<ChartVM> {
  if (getFeatureFlag('CHART_USE_DEMO_DATA')) return buildDemoChartVM(range);
  try {
    const vm = await repo.fetchMetricsDay(range, metrics);
    if (!vm?.days?.length) return buildDemoChartVM(range); // DB trống → demo
    return vm;
  } catch {
    return buildDemoChartVM(range); // lỗi fetch → demo
  }
}
