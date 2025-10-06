export type MetricPoint = { ts: string; value: number };
export type BPPoint = { ts: string; sys: number; dia: number };

export type ContextMetrics = {
  bg: MetricPoint[];
  water: MetricPoint[];
  weight: MetricPoint[];
  bp: BPPoint[];
  insulin: MetricPoint[];
  latest?: {
    bg?: number;
    bp?: { sys: number; dia: number };
    weight?: number;
  };
};

export type AIContext = {
  userId: string;
  windowDays: number;
  summary: string;
  metrics: ContextMetrics;
};

export type Intent = 
  | "coach_checkin" 
  | "reminder_reason" 
  | "safety_escalation" 
  | "classify_intent"
  | "detect_intent";

export type SafetyResult =
  | { escalate: false }
  | { escalate: true; text: string; reason: string; kind: "bg" | "bp" };