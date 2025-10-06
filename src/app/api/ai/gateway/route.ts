// src/app/api/ai/gateway/route.ts — Full AI pipeline with cost optimization
import { NextRequest, NextResponse } from "next/server";
import { buildCompressedContext, CompressedAIContext as _CompressedAIContext } from "@/modules/ai/context";
import { validateSafety } from "@/modules/ai/guardrails";
import { callLLM, Intent, maxTokensForIntent, routeModelForIntent } from "@/modules/ai/models";
import { sha1, getCache, setCache, addDailyTokenUsage, getDailyTokenUsage } from "@/modules/ai/cache";
import { getFeatureFlag } from "../../../../../config/feature-flags";

// Cấu hình route để luôn động
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// Stub mode flag
const USE_STUB = process.env.AI_GATEWAY_STUB === 'true';

// ENV variables with safe defaults - Cập nhật để sử dụng getFeatureFlag
const AI_MODEL_DEFAULT = process.env.AI_MODEL_DEFAULT || "gpt-5-nano"; // Giữ nguyên nếu không có flag tương ứng
const AI_MAXTOKENS_DEFAULT = parseInt(process.env.AI_MAXTOKENS_DEFAULT || "60"); // Giữ nguyên nếu không có flag tương ứng
const AI_MAXTOKENS_SAFETY = parseInt(process.env.AI_MAXTOKENS_SAFETY || "120"); // Giữ nguyên nếu không có flag tương ứng
const AI_CACHE_TTL_SHORT_MIN = parseInt(process.env.AI_CACHE_TTL_SHORT_MIN || "60"); // Giữ nguyên nếu không có flag tương ứng
const AI_CACHE_TTL_LONG_MIN = parseInt(process.env.AI_CACHE_TTL_LONG_MIN || "1440"); // Giữ nguyên nếu không có flag tương ứng
const AI_BUDGET_DAILY_TOKENS = parseInt(process.env.AI_BUDGET_DAILY_TOKENS || "300000"); // Giữ nguyên nếu không có flag tương ứng

// ... (giữ nguyên các biến ENV và các phần còn lại của file)

type GatewayBody = {
  user_id: string;
  intent?: Intent;
  message?: string;
};

function safeJsonParse(text: string) {
  try {
    return { ok: true as const, data: JSON.parse(text) };
  } catch (e: any) {
    return { ok: false as const, error: e?.message || "invalid_json" };
  }
}

// Rule-based fallback responses (1-2 sentences)
const RULE_BASED_RESPONSES: Record<string, string> = {
  simple_qa: "Mục tiêu nước ngày ~30–35 ml/kg. Ví dụ 60 kg → ~1800–2100 ml. Chia nhỏ cả ngày.",
  meal_tip: "Ưu tiên tinh bột chậm (gạo lứt/bún gạo lứt), đạm nạc, rau xanh 1/2 đĩa, hạn chế đường thêm.",
  reminder_reason: "Nhắc để tạo thói quen ổn định. Ghi lại sẽ giúp theo dõi tiến độ và phát hiện bất thường sớm.",
  safety_escalation: "⚠️ Tình huống nguy hiểm. Vui lòng liên hệ bác sĩ hoặc cơ sở y tế gần nhất để được tư vấn kịp thời.",
};

// Simple intent classification based on keywords
function classifyIntent(message: string): Intent {
  const lower = message.toLowerCase();
  
  // Safety keywords
  if (lower.includes("ngất") || lower.includes("chóng mặt") || lower.includes("hạ đường huyết") || 
      /(?:bg|đường)[^\d]*(?:[1-6]\d|[1-9])(?!\d)/.test(lower) || // BG < 70
      /(?:\d{3,}|\d{2}0)/.test(lower.replace(/\D/g, ''))) { // Very high numbers
    return "safety_escalation";
  }
  
  // Meal keywords
  if (lower.includes("bữa ăn") || lower.includes("thực đơn") || lower.includes("ăn gì") || 
      lower.includes("món") || lower.includes("nấu")) {
    return "meal_tip";
  }
  
  // Reminder keywords
  if (lower.includes("nhắc nhở") || lower.includes("tại sao") || lower.includes("lý do")) {
    return "reminder_reason";
  }
  
  // Complex coaching keywords
  if (lower.includes("kế hoạch") || lower.includes("chiến lược") || lower.includes("tư vấn")) {
    return "complex_coaching";
  }
  
  return "simple_qa";
}

export async function GET() {
  if (USE_STUB) {
    return NextResponse.json({
      ok: true,
      status: "healthy",
      mode: "stub",
      message: "AI Gateway in stub mode (AI_GATEWAY_STUB=true)"
    });
  }
  return NextResponse.json({ ok: true, status: "healthy" });
}

export async function POST(req: NextRequest) {
  const runId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    const idempKey = req.headers.get("Idempotency-Key") || "";
    const raw = await req.text();
    if (!raw) {
      return NextResponse.json(
        { error: "Bad Request", message: "empty body" },
        { status: 400 }
      );
    }

    const parsed = safeJsonParse(raw);
    if (!parsed.ok) {
      return NextResponse.json(
        { error: "Bad Request", message: "invalid JSON" },
        { status: 400 }
      );
    }

    const body = parsed.data as GatewayBody;

    if (!body?.user_id) {
      return NextResponse.json(
        { error: "Bad Request", message: "user_id is required" },
        { status: 400 }
      );
    }

    // Stub mode: return mock response immediately
    if (USE_STUB) {
      const stubResponse = {
        request_id: runId,
        ts: Date.now(),
        model: "stub",
        tokens: 0,
        output: "Đây là câu trả lời stub. AI Gateway đang ở chế độ stub (AI_GATEWAY_STUB=true).",
        safety: "low",
        idempotency_key: idempKey || null,
        mode: "stub"
      };
      console.log(`[AI Gateway] runId=${runId} status=stub duration=${Date.now() - startTime}ms`);
      return NextResponse.json(stubResponse);
    }

    // 1) Idempotency check
    if (idempKey) {
      const prev = await getCache(idempKey);
      if (prev) {
        console.log(`[AI Gateway] runId=${runId} status=idempotent_hit duration=${Date.now() - startTime}ms`);
        return NextResponse.json(JSON.parse(prev));
      }
    }

    // 2) Intent determination
    const currentIntent: Intent = body.intent || classifyIntent(body.message || "");

    // 3) Build compressed context (60-70% token reduction)
    const ctx = await buildCompressedContext(body.user_id);
    const ctxString = JSON.stringify(ctx);
    const ctxSize = ctxString.length;

    // 4) Choose model & maxTokens (30-40% token reduction)
    const model = routeModelForIntent(currentIntent);
    const maxTokens = maxTokensForIntent(currentIntent);

    // 5) Estimate approxTokens
    const systemPrompt = "Bạn là trợ lý DIABOT. KHÔNG chẩn đoán/kê thuốc. Trả lời 1–2 câu, thân thiện, rõ ràng. Nếu tình huống nguy hiểm → khuyên gặp bác sĩ.";
    const userPrompt = body.message || "";
    const approxTokens = Math.ceil((systemPrompt.length + userPrompt.length + ctxSize) / 4);

    // 6) Budget guard
    if (getFeatureFlag('AI_BUDGET_ENABLED')) { // Sử dụng getFeatureFlag
      const dailyUsedTokens = getDailyTokenUsage(body.user_id);
      if (dailyUsedTokens + approxTokens > AI_BUDGET_DAILY_TOKENS) {
        if (getFeatureFlag('AI_BUDGET_DROP_ON_EXCEEDED') || ["simple_qa", "meal_tip", "reminder_reason"].includes(currentIntent)) { // Sử dụng getFeatureFlag
          const response = {
            request_id: runId,
            ts: Date.now(),
            model: "rule-based",
            tokens: 0,
            output: RULE_BASED_RESPONSES[currentIntent] || "Xin lỗi, tôi không thể trả lời yêu cầu này do giới hạn ngân sách token.",
            safety: "low",
            idempotency_key: idempKey || null,
          };
          console.log(`[AI Gateway] runId=${runId} intent=${currentIntent} status=budget_exceeded duration=${Date.now() - startTime}ms`);
          return NextResponse.json(response, { headers: { "X-Token-Budget": "exceeded" } });
        }
      }
    }


    // 7) Cache lookup
    let cacheKey = "";
    if (getFeatureFlag('AI_CACHE_ENABLED')) {
      cacheKey = sha1(body.user_id + currentIntent + sha1(ctxString) + sha1(userPrompt));
      const cachedResponse = await getCache(cacheKey);
      if (cachedResponse) {
        console.log(`[AI Gateway] runId=${runId} intent=${currentIntent} model=${model} maxTokens=${maxTokens} ctxSize=${ctxSize} approxTokens=${approxTokens} status=cache_hit duration=${Date.now() - startTime}ms`);
        addDailyTokenUsage(body.user_id, 0); // No tokens used from LLM
        return NextResponse.json(JSON.parse(cachedResponse));
      }
    }

    // 8) Safety check with compressed context
    const safety = validateSafety({ metrics: { latest: ctx.bg ? { bg: ctx.bg.latest } : {} } } as any, body.message || "");
    if (safety.escalate) {
      const response = {
        request_id: runId,
        ts: Date.now(),
        model: "safety",
        tokens: 0,
        output: safety.text,
        safety: "high",
        idempotency_key: idempKey || null,
      };

      if (idempKey) await setCache(idempKey, JSON.stringify(response), AI_CACHE_TTL_LONG_MIN);
      console.log(`[AI Gateway] runId=${runId} intent=${currentIntent} status=safety_escalation duration=${Date.now() - startTime}ms`);
      return NextResponse.json(response);
    }

    // 9) Call LLM with optimized parameters
    const result = await callLLM({
      model,
      system: systemPrompt, // Shortened system prompt (40-50% reduction)
      prompt: userPrompt,
      maxTokens, // Reduced max tokens (25-35% reduction)
      disableRetry: !!(getFeatureFlag('AI_DISABLE_RETRY')),
    });

    // Add tokens to daily usage
    addDailyTokenUsage(body.user_id, result.usage?.total_tokens || 0);

    const response = {
      request_id: runId,
      ts: Date.now(),
      model,
      tokens: result.usage?.total_tokens || 0,
      output: result.text,
      safety: "low",
      idempotency_key: idempKey || null,
    };

    // 10) Save cache
    if (getFeatureFlag('AI_CACHE_ENABLED') && cacheKey) {
      const ttl = ["simple_qa", "meal_tip", "reminder_reason", "classify_intent"].includes(currentIntent)
        ? AI_CACHE_TTL_SHORT_MIN
        : AI_CACHE_TTL_LONG_MIN;
      await setCache(cacheKey, JSON.stringify(response), ttl);
    }
    if (idempKey) {
      await setCache(idempKey, JSON.stringify(response), AI_CACHE_TTL_LONG_MIN);
    }

    // 11) Log concisely (mask secrets)
    console.log(`[AI Gateway] runId=${runId} intent=${currentIntent} model=${model} maxTokens=${maxTokens} ctxSize=${ctxSize} approxTokens=${approxTokens} tokensUsed=${result.usage?.total_tokens || 0} status=success duration=${Date.now() - startTime}ms`);

    return NextResponse.json(response);
      // ...
    } catch (err: any) {
      const duration = Date.now() - startTime;
      console.error(`[AI Gateway Error] runId=${runId} duration=${duration}ms error=${err?.message || "unknown"}`);

      // Xử lý lỗi AI_DISABLED cụ thể
      if (err.message === "AI_DISABLED: OPENAI_API_KEY is not set.") {
        return NextResponse.json(
          { error: "AI_DISABLED", message: "AI service is currently disabled due to missing API key." },
          { status: 503 } // 503 Service Unavailable
        );
      }

      return NextResponse.json(
        { error: "InternalError", message: err?.message || "internal" },
        { status: 500 }
      );
    }
}
