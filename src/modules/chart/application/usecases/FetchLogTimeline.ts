import { Metric, RangeOption, TimelineVM } from "../../domain/types";
import { buildDemoTimelineVM } from "../../infrastructure/adapters/DemoData";

import { getFeatureFlag } from "../../../../../config/feature-flags";


export async function FetchLogTimeline(range: RangeOption, metrics?: Metric[], cursor?: string | null): Promise<TimelineVM> {
  if (getFeatureFlag('CHART_USE_DEMO_DATA')) {
    return buildDemoTimelineVM(range);
  }
  return buildDemoTimelineVM(range);
}
