export function buildDemoAnswer(intent: string, query = ""): string {
  switch (intent) {
    case "reminder":
      return "Gợi ý nhắc: Uống 1 cốc (~250ml) mỗi 60–90 phút. Nếu tập thể dục hoặc trời nóng, thêm 1 cốc.";
    case "meal_tip":
      return [
        "Pizza thường nhiều carb & chất béo. Mẹo ăn an toàn:",
        "• Ăn 1–2 lát mỏng, kèm salad rau xanh.",
        "• Uống nước lọc, tránh đồ ngọt.",
        "• Đi bộ 10–15 phút sau ăn.",
        "• Theo dõi đường huyết 2h sau bữa."
      ].join("\n");
    default:
      return "Mình đã ghi nhận câu hỏi. Bạn nói rõ hơn mục tiêu (ví dụ: nước, bữa ăn, vận động) để mình gợi ý cụ thể.";
  }
}
