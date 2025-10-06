import { AIContext } from "./types";

export function analyzeTrends(ctx: AIContext) {
  const trends: string[] = [];
  const bg = ctx.metrics.bg.map(p => p.value);
  if (bg.length >= 2) {
    const diff = bg.at(-1)! - bg[0];
    if (diff > 20) trends.push("BG có xu hướng tăng.");
    else if (diff < -20) trends.push("BG có xu hướng giảm.");
    else trends.push("BG ổn định.");
  }
  if (ctx.metrics.weight.length >= 2) {
    const diffW = ctx.metrics.weight.at(-1)!.value - ctx.metrics.weight[0].value;
    if (diffW > 1) trends.push("Cân nặng tăng nhẹ.");
    if (diffW < -1) trends.push("Cân nặng giảm nhẹ.");
  }
  return trends;
}
