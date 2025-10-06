export type Intent = "simple_qa" | "reminder" | "meal_tip";

export type GatewayInput = {
  intent: Intent;
  userId?: string;
  query?: string;
  locale?: string;
  mode?: "demo" | "premium";
};

export function routeIntent(input: GatewayInput): Intent {
  // Ưu tiên intent do client gửi
  if (input.intent) return input.intent;

  // Heuristic cực nhẹ nếu thiếu intent
  const q = (input.query || "").toLowerCase();
  if (/(uống|nước|drink|water)/.test(q)) return "reminder";
  if (/(ăn|bữa|meal|pizza|cơm|carb)/.test(q)) return "meal_tip";
  return "simple_qa";
}

