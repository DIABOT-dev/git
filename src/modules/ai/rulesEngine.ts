// src/modules/ai/rulesEngine.ts
// Rule-based meal tip generator (MVP - no LLM)

export interface MealData {
  kcal?: number;
  carb_g?: number;
  protein_g?: number;
  fat_g?: number;
  meal_type?: string;
  cooking_method?: string;
  items?: Array<{ name?: string; food?: string }>;
}

export interface UserFeatures {
  carb_g_total_yesterday?: number;
  protein_g_total_yesterday?: number;
  fat_g_total_yesterday?: number;
  dinner_pct_7d?: number;
  fried_count_7d?: number;
  latest_bg?: number;
}

export interface RuleTip {
  summary: string;
  suggestions: string[];
  conclusion: string;
}

/**
 * Generate meal tip based on rules (no LLM)
 * Follows DIABOT_CORE_DESIGN.md section 7
 */
export function generateMealTip(
  meal: MealData,
  features: UserFeatures
): RuleTip {
  const suggestions: string[] = [];
  let summary = 'Bữa ăn được ghi nhận';

  // Rule 1: Carb cao (≥45g/bữa hoặc hôm qua cao)
  if (meal.carb_g && meal.carb_g >= 45) {
    suggestions.push('Bớt tinh bột nhanh, thêm rau xanh hoặc xơ để cân bằng đường huyết');
  } else if (features.carb_g_total_yesterday && features.carb_g_total_yesterday >= 180) {
    suggestions.push('Hôm qua carb đã cao, hôm nay ưu tiên rau và đạm nạc nhé');
  }

  // Rule 2: Protein thấp (<15-20g/bữa)
  if (meal.protein_g !== undefined && meal.protein_g < 15) {
    suggestions.push('Thêm cá, ức gà, đậu phụ hoặc trứng để đủ đạm');
  } else if (features.protein_g_total_yesterday && features.protein_g_total_yesterday < 50) {
    suggestions.push('Hôm qua thiếu đạm, hôm nay cố gắng ăn thêm thịt nạc hoặc cá');
  }

  // Rule 3: Fat cao (>20g) - ưu tiên chất béo tốt
  if (meal.fat_g && meal.fat_g > 20) {
    suggestions.push('Giảm món chiên/mỡ, chuyển sang hạt, cá, hoặc dầu oliu');
  }

  // Rule 4: Kcal cao (>600 kcal/bữa)
  if (meal.kcal && meal.kcal > 600) {
    suggestions.push('Chia nhỏ bữa ăn, ưu tiên rau + đạm nạc để giảm tải');
  }

  // Rule 5: BG cao gần đây (>180 mg/dL)
  if (features.latest_bg && features.latest_bg > 180) {
    suggestions.push('Đường huyết cao, ưu tiên low-carb + vận động nhẹ 10-15 phút');
  }

  // Rule 6: Tần suất món chiên cao (>3 lần/tuần)
  if (features.fried_count_7d && features.fried_count_7d > 3) {
    suggestions.push('Tuần này nhiều món chiên rồi, thử món hấp hoặc luộc nhé');
  }

  // Fallback: không đủ dữ liệu
  if (suggestions.length === 0) {
    suggestions.push('Tiếp tục theo dõi và ghi chép đều đặn');
    suggestions.push('Cân bằng rau, đạm, tinh bột theo tỷ lệ 2:1:1');
  }

  // Giới hạn 2 suggestions
  const topSuggestions = suggestions.slice(0, 2);

  // Summary
  const itemNames = meal.items?.map(i => i.name || i.food).filter(Boolean).join(', ') || 'bữa ăn';
  summary = `Ghi nhận ${itemNames}`;

  // Conclusion
  const conclusion = 'Tiếp tục duy trì nhé, bạn đang làm tốt lắm!';

  return {
    summary,
    suggestions: topSuggestions,
    conclusion
  };
}

/**
 * Format tip thành string ≤800 chars (3 phần: summary → suggestions → conclusion)
 */
export function formatTip(tip: RuleTip): string {
  const parts = [
    tip.summary,
    ...tip.suggestions.map((s, i) => `${i + 1}. ${s}`),
    tip.conclusion
  ];

  let formatted = parts.join('. ') + '.';

  // Ensure ≤800 chars
  if (formatted.length > 800) {
    formatted = formatted.substring(0, 797) + '...';
  }

  return formatted;
}
