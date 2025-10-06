type TelemetryEvent =
  | "chart_open"
  | "chart_toggle_range"
  | "chart_filter_change"
  | "chart_timeline_load_more"
  | "chart_error";

export function track(event: TelemetryEvent, props?: Record<string, any>) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log("[telemetry]", event, props || {});
  }
}
