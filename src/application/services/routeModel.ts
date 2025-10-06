export function routeModel(moat: string, intent: string): string {
  const nano = process.env.MODEL_NANO ?? "gpt-5-nano";
  const mini = process.env.MODEL_MINI ?? "gpt-5-mini";

  const useMini =
    moat?.toLowerCase() === "coach" ||
    (intent && /explain|giải thích|tư vấn|coach/i.test(intent));

  return useMini ? mini : nano;
}
