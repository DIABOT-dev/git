// src/ai/router/RouterPolicy.ts
// Chọn model theo intent + rule cơ bản

export type Intent =
  | "classify_intent"
  | "coach_checkin"
  | "reminder_reason"
  | "safety_escalation"
  | "meal_feedback";

export type RouterDecision = {
  model: string;
  temperature: number;
  cacheTtlSec: number;
};

export function routeIntent(intent: Intent): RouterDecision {
  switch (intent) {
    case "classify_intent":
      return { model: process.env.MODEL_NANO || "gpt-5-nano", temperature: 0, cacheTtlSec: 600 };
    case "safety_escalation":
      return { model: process.env.MODEL_MINI || "gpt-5-mini", temperature: 0, cacheTtlSec: 0 };
    case "reminder_reason":
      return { model: process.env.MODEL_MINI || "gpt-5-mini", temperature: 0.2, cacheTtlSec: 300 };
    case "meal_feedback":
      return { model: process.env.MODEL_MINI || "gpt-5-mini", temperature: 0.2, cacheTtlSec: 120 };
    case "coach_checkin":
    default:
      return { model: process.env.MODEL_MINI || "gpt-5-mini", temperature: 0.2, cacheTtlSec: 120 };
  }
}
