import type { AIContext } from './types';

/**
 * Template cho coach check-in thường ngày
 */
export function coach_checkin(context: AIContext): string {
  return `Bạn là trợ lý sức khỏe DIABOT, chuyên hỗ trợ người bệnh tiểu đường.

NGUYÊN TẮC QUAN TRỌNG:
- KHÔNG chẩn đoán bệnh
- KHÔNG kê đơn thuốc  
- KHÔNG thay thế bác sĩ
- CHỈ khuyến khích theo dõi và tư vấn lối sống
- Khi số đo bất thường → khuyên gặp bác sĩ

PHONG CÁCH:
- Thân thiện, động viên
- Ngắn gọn, dễ hiểu (1-2 câu)
- Tập trung vào hành động cụ thể
- Sử dụng emoji phù hợp

DỮ LIỆU NGƯỜI DÙNG:
${context.summary}

Hãy đưa ra 1-2 việc cụ thể người dùng nên làm hôm nay để cải thiện sức khỏe. Trả lời ngắn gọn, thân thiện.`;
}

/**
 * Template cho nhắc nhở với lý do
 */
export function reminder_reason(context: AIContext, message: string): string {
  return `Bạn là trợ lý DIABOT, giải thích lý do nhắc nhở.

NGUYÊN TẮC:
- Giải thích TẠI SAO việc này quan trọng
- Động viên, không áp lực
- Đưa ra lợi ích cụ thể
- Ngắn gọn (1-2 câu)

DỮ LIỆU NGƯỜI DÙNG:
${context.summary}

NGƯỜI DÙNG HỎI: ${message}

Hãy giải thích tại sao việc này quan trọng cho sức khỏe của họ. Trả lời ngắn gọn, thân thiện.`;
}

/**
 * Template cho tình huống nguy hiểm - chuyển hướng y tế
 */
export function safety_escalation(reason: string): string {
  return `⚠️ Chỉ số sức khỏe bất thường được phát hiện. ${reason} Vui lòng liên hệ bác sĩ hoặc cơ sở y tế gần nhất để được tư vấn kịp thời. DIABOT không thể thay thế lời khuyên y tế chuyên nghiệp.`;
}

/**
 * Kiểm tra số đo có nguy hiểm không
 */
export function validateSafety(context: AIContext, message: string): { escalate: false } | { escalate: true; text: string; reason: string; kind: "bg" | "bp" } {
  const { metrics } = context;
  
  // Parse message để tìm số đo nguy hiểm
  const bgMatch = message.match(/(?:bg|đường|glucose)[^\d]*(\d{2,3})/i);
  const bpMatch = message.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
  
  // BG nguy hiểm: <70 hoặc >300 mg/dL
  const checkBG = bgMatch ? parseInt(bgMatch[1]) : metrics.latest?.bg;
  if (checkBG && (checkBG < 70 || checkBG > 300)) {
    const reason = checkBG < 70 
      ? `Đường huyết thấp (${checkBG} mg/dL).`
      : `Đường huyết cao (${checkBG} mg/dL).`;
    return {
      escalate: true,
      kind: "bg",
      reason,
      text: safety_escalation(reason)
    };
  }

  // BP nguy hiểm: SYS >180 hoặc DIA >110
  const checkBP = bpMatch 
    ? { sys: parseInt(bpMatch[1]), dia: parseInt(bpMatch[2]) }
    : metrics.latest?.bp;
    
  if (checkBP && (checkBP.sys > 180 || checkBP.dia > 110)) {
    const reason = `Huyết áp cao (${checkBP.sys}/${checkBP.dia} mmHg).`;
    return {
      escalate: true,
      kind: "bp", 
      reason,
      text: safety_escalation(reason)
    };
  }

  return { escalate: false };
}