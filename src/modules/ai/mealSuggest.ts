import { AIContext } from "./types";

export function suggestMeal(ctx: AIContext) {
  const suggestions: string[] = [];
  if (ctx.metrics.bg.length && ctx.metrics.bg.at(-1)!.value > 180) {
    suggestions.push("Ưu tiên bữa nhẹ ít tinh bột, nhiều rau.");
  } else {
    suggestions.push("Có thể dùng khẩu phần cơm gạo lứt + đạm nạc.");
  }
  suggestions.push("Đừng quên uống thêm nước.");
  return suggestions;
}
