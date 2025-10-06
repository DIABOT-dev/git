import { NextResponse } from "next/server";
import { routeIntent, type GatewayInput } from "./router";
import { hardTruncate } from "../tools/truncate";
import { SAFETY_NOTE } from "../policies/safety";
import { buildDemoAnswer } from "../prompts/simple";

// (Tùy chọn) gọi OpenAI khi cần thật sự (premium)
async function callOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Không có key thì trả demo luôn để không tốn token
    return buildDemoAnswer("simple_qa");
  }

  // Bạn có thể dùng SDK chính thức; ở đây dùng fetch cho gọn
  const body = {
    model: "gpt-5-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 250,
    temperature: 0.2
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    return `⛔ Lỗi model: ${res.status}. Dùng câu trả lời ngắn thay thế.\n${buildDemoAnswer("simple_qa")}\n${err ? `\n[err] ${err}` : ""}`;
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  return text.trim();
}

export async function handleAiGateway(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const body = await req.json().catch(() => ({}));
    const input: GatewayInput = {
      intent: body?.intent,
      userId: body?.user_id || body?.userId,
      query: hardTruncate(body?.query ?? "", 1000),
      locale: body?.locale || "vi-VN",
      mode: body?.mode || "demo"
    };

    const intent = routeIntent(input);

    // DEMO MODE: trả câu trả lời template – KHÔNG gọi model (siêu tiết kiệm)
    if (input.mode === "demo") {
      const answer = buildDemoAnswer(intent, input.query);
      return NextResponse.json(
        { ok: true, intent, mode: "demo", answer, safety: SAFETY_NOTE },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    // PREMIUM MODE: gọi model khi thật cần
    const userPrompt = [
      SAFETY_NOTE,
      `Ngữ cảnh: intent=${intent}, locale=${input.locale}, userId=${input.userId ?? "anon"}, ip=${ip}`,
      `Câu hỏi: "${input.query || "(trống)"}"`,
      "Yêu cầu: trả lời <=120 từ, gạch đầu dòng khi hợp lý, kèm 1 hành động tiếp theo."
    ].join("\n\n");

    const modelAnswer = await callOpenAI(userPrompt);

    return NextResponse.json(
      { ok: true, intent, mode: "premium", answer: modelAnswer },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Gateway error" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
