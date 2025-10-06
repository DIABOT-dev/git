import { AIContext, SafetyResult } from "./types";
import { safety_escalation } from "./prompt";

export function validateExtended(ctx: AIContext): SafetyResult {
  const insulin = ctx.metrics.insulin.at(-1)?.value;
  const weight = ctx.metrics.weight.map(w => w.value);
  if (insulin && insulin > 50) {
    const reason = `Liều insulin ${insulin} units vượt ngưỡng an toàn.`;
    return { escalate: true, text: safety_escalation(reason), reason, kind: "bg" };
  }
  if (weight.length >= 2) {
    const diff = weight.at(-1)! - weight[0];
    if (diff < -5) {
      const reason = `Cân nặng giảm nhanh ${diff} kg trong 7 ngày.`;
      return { escalate: true, text: safety_escalation(reason), reason, kind: "bp" };
    }
  }
  return { escalate: false };
}
