import { ChartVM, Metric, RangeOption } from "../../domain/types";
import { buildDemoChartVM } from "../../infrastructure/adapters/DemoData";
import { getFeatureFlag } from "../../../../../config/feature-flags";

export async function FetchChartData(range: RangeOption, metrics?: Metric[]): Promise<ChartVM> {
  if (getFeatureFlag('CHART_USE_DEMO_DATA')) {
    return buildDemoChartVM(range);
  }
  return buildDemoChartVM(range);
}
