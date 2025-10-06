import { Metric, RangeOption, TimelineVM } from "../../domain/types";
import { ChartRepoSupabase } from "../../infrastructure/adapters/ChartRepo.supabase";
import { buildDemoTimelineVM } from "../../infrastructure/adapters/DemoData";
import { getFeatureFlag } from "../../../../../config/feature-flags";

const repo = new ChartRepoSupabase();

export async function FetchLogTimeline(range: RangeOption, metrics?: Metric[], cursor?: string | null): Promise<TimelineVM> {
  if (getFeatureFlag('CHART_USE_DEMO_DATA')) return buildDemoTimelineVM(range);
  try {
    const vm = await repo.fetchTimeline(range, metrics, cursor);
    if (!vm?.groups?.length) return buildDemoTimelineVM(range);
    return vm;
  } catch {
    return buildDemoTimelineVM(range);
  }
}
