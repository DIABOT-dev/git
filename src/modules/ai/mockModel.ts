import type { AIContext, Intent } from "./types";

export async function generateMock(opts:{intent:string; ctx:AIContext; message?:string}) {
  const { intent, ctx, message="" } = opts;
  if (intent === "coach_checkin") {
    return { text: "Uống 1 cốc nước, đi bộ nhẹ 5–10 phút. Ghi 1 log bữa/đường huyết hôm nay.", usage: undefined };
  }
  if (intent === "reminder_reason") {
    return { text: "Nhắc để giữ thói quen đều mỗi ngày và giúp biểu đồ rõ xu hướng. Ok mình tiếp tục nhắc nhé?", usage: undefined };
  }
  return { text: "⚠️ Cảnh báo an toàn. Vui lòng đo lại và liên hệ cơ sở y tế khi cần.", usage: undefined };
}