import type { AIContext, Intent } from '../types';

export async function generateMock(opts: {
  intent: Intent;
  ctx: AIContext;
  message?: string;
}): Promise<{ text: string; usage?: any }> {
  const { intent, ctx, message = "" } = opts;

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

  switch (intent) {
    case "coach_checkin":
      return {
        text: "💧 Uống 1 cốc nước, đi bộ nhẹ 5-10 phút. 📊 Ghi 1 log đường huyết hôm nay để theo dõi xu hướng.",
        usage: { prompt_tokens: 45, completion_tokens: 25, total_tokens: 70 }
      };

    case "reminder_reason":
      if (message.includes("nước")) {
        return {
          text: "Uống đủ nước giúp ổn định đường huyết và hỗ trợ thận lọc glucose hiệu quả hơn. 💪",
          usage: { prompt_tokens: 38, completion_tokens: 20, total_tokens: 58 }
        };
      }
      if (message.includes("đường huyết") || message.includes("BG")) {
        return {
          text: "Theo dõi đường huyết đều đặn giúp phát hiện sớm biến động và điều chỉnh kịp thời. 📈",
          usage: { prompt_tokens: 42, completion_tokens: 22, total_tokens: 64 }
        };
      }
      return {
        text: "Thói quen theo dõi đều đặn giúp bạn hiểu rõ cơ thể và đưa ra quyết định sức khỏe tốt hơn. ✨",
        usage: { prompt_tokens: 40, completion_tokens: 24, total_tokens: 64 }
      };

    case "safety_escalation":
      return {
        text: "⚠️ Phát hiện chỉ số bất thường. Vui lòng liên hệ bác sĩ hoặc cơ sở y tế gần nhất để được tư vấn kịp thời.",
        usage: { prompt_tokens: 35, completion_tokens: 28, total_tokens: 63 }
      };

    case "classify_intent":
    case "detect_intent":
      return {
        text: "coach_checkin",
        usage: { prompt_tokens: 15, completion_tokens: 8, total_tokens: 23 }
      };

    default:
      return {
        text: "Xin chào! Tôi là DIABOT, trợ lý sức khỏe của bạn. Tôi có thể giúp gì cho bạn hôm nay? 🤖",
        usage: { prompt_tokens: 30, completion_tokens: 20, total_tokens: 50 }
      };
  }
}