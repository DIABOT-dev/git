// src/lib/ai/gatewayClient.ts
export type GatewayIntent =
  | "simple_qa" | "meal_tip" | "reminder_reason" | "complex_coaching" | "safety_escalation";

export type GatewayResponse = {
  request_id: string;
  ts: number;
  model: string;
  tokens: number;
  output: string;
  safety: "low" | "high";
  idempotency_key?: string | null;
  mode?: "stub";
};

export async function callGateway(opts: {
  userId: string;
  message: string;
  intent?: GatewayIntent;
  idempotencyKey?: string;
  signal?: AbortSignal;
}): Promise<GatewayResponse> {
  const res = await fetch("/api/ai/gateway", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(opts.idempotencyKey ? { "Idempotency-Key": opts.idempotencyKey } : {}),
    },
    body: JSON.stringify({
      user_id: opts.userId,
      message: opts.message,
      intent: opts.intent,
    }),
    signal: opts.signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Gateway HTTP ${res.status}`);
  }
  return res.json();
}
