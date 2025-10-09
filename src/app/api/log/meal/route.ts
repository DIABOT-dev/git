import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/getUserId";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getFeatureFlag } from "../../../../../config/feature-flags";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

// Zod schema với validation logic theo GOALS(4)
const MealLogRequestBodySchema = z.object({
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
  ts: z.string().datetime().optional(),
  text: z.string().optional(),
  portion: z.enum(["low", "medium", "high"]).optional(),
  image_url: z.string().url().optional(),
}).refine(
  (data) => data.text || data.image_url,
  {
    message: "At least one of 'text' or 'image_url' must be provided",
    path: ["text", "image_url"],
  }
);

// In-memory mock store for MEAL_MOCK_MODE
const mockMealLogs: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth(request);

    const rawBody = await request.json();

    // Validate request body bằng Zod
    const parseResult = MealLogRequestBodySchema.safeParse(rawBody);

    if (!parseResult.success) {
      console.error("Meal log validation error:", parseResult.error.flatten());
      return NextResponse.json({ ok: false, error: parseResult.error.flatten() }, { status: 400 });
    }

    const body = parseResult.data;

    // Set defaults
    const meal_type = body.meal_type ?? "snack";
    const ts = body.ts ?? new Date().toISOString();
    const portion = body.portion ?? "medium";

    // Build items array theo quy tắc GOALS(4)
    const items: any[] = [];
    if (body.text && body.image_url) {
      // Cả text và image_url
      items.push({ name: body.text, imageUrl: body.image_url });
    } else if (body.text) {
      // Chỉ text
      items.push({ name: body.text });
    } else if (body.image_url) {
      // Chỉ image_url
      items.push({ imageUrl: body.image_url });
    }
    // Không có cả hai đã được validate bởi Zod refine

    // Kiểm tra MEAL_MOCK_MODE
    if (getFeatureFlag('MEAL_MOCK_MODE')) {
      console.warn('MEAL_MOCK_MODE=on → using in-memory mock for meal log');
      const mockData = {
        id: `mock-${Date.now()}`,
        user_id: userId,
        meal_type,
        items,
        portion,
        taken_at: ts,
        created_at: new Date().toISOString(),
      };
      mockMealLogs.push(mockData);
      return NextResponse.json({ ok: true, data: mockData }, { status: 201 });
    }

    // Insert vào meal_logs với Supabase Admin
    const { data, error } = await supabaseAdmin // Gọi supabaseAdmin như một hàm
      .from("meal_logs")
      .insert({
        user_id: userId,
        items,
        carbs_g: null,
        calories_kcal: null,
        taken_at: ts,
      })
      .select("id, user_id, items, taken_at, created_at")
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (err: any) {
    if (err.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error in /api/log/meal:", err);
    return NextResponse.json({ ok: false, error: err.message || "unknown" }, { status: 500 });
  }
}
