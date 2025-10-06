// src/modules/ai/guardrails.ts
import type { AIContext } from "./context";
import { safety_escalation } from "./prompt";

export type SafetyResult =
  | { escalate: false }
  | { escalate: true; text: string; reason: string; kind: "bg" | "bp" };

const BG_LOW = 70;
const BG_HIGH = 300;
const SYS_HIGH = 180;
const DIA_HIGH = 120;

// Parse con số nguy cơ từ message (ví dụ: "BG=320", "đường 320", "huyết áp 182/121")
function parseFromMessage(msg: string) {
  const lower = msg.toLowerCase();

  // BG
  const bgMatch = lower.match(/(?:bg|đường|glucose)[^\d]{0,6}(\d{2,3})/);
  const bg = bgMatch ? Number(bgMatch[1]) : undefined;

  // BP "sys/dia"
  const bpMatch = lower.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
  const bp = bpMatch ? { sys: Number(bpMatch[1]), dia: Number(bpMatch[2]) } : undefined;

  return { bg, bp };
}

export function validateSafety(ctx: AIContext, message: string): SafetyResult {
  const latestBG = ctx.metrics.latest?.bg;
  const latestBP = ctx.metrics.latest?.bp;

  const { bg: msgBG, bp: msgBP } = parseFromMessage(message);

  // BG rules
  const checkBG = (val?: number) =>
    typeof val === "number" && (val < BG_LOW || val > BG_HIGH);

  if (checkBG(msgBG) || checkBG(latestBG)) {
    const val = msgBG ?? latestBG!;
    const reason =
      val < BG_LOW
        ? `BG ghi nhận ${val} mg/dL (thấp hơn ${BG_LOW}).`
        : `BG ghi nhận ${val} mg/dL (cao hơn ${BG_HIGH}).`;
    return { escalate: true, kind: "bg", reason, text: safety_escalation(reason) };
  }

  // BP rules
  const checkBP = (bp?: { sys: number; dia: number }) =>
    !!bp && (bp.sys >= SYS_HIGH || bp.dia >= DIA_HIGH);

  if (checkBP(msgBP) || checkBP(latestBP)) {
    const bpv = msgBP ?? latestBP!;
    const reason = `BP ghi nhận ${bpv.sys}/${bpv.dia} mmHg (ngưỡng cảnh báo: sys≥${SYS_HIGH} hoặc dia≥${DIA_HIGH}).`;
    return { escalate: true, kind: "bp", reason, text: safety_escalation(reason) };
  }

  return { escalate: false };
}
