import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/getUserId';
import { generateRequestId, trackTipShown } from '@/lib/analytics/eventTracker';
import { FeatureStoreRepo } from '@/modules/meal/infrastructure/FeatureStoreRepo';
import { generateMealTip, formatTip, type MealData, type UserFeatures } from '@/modules/ai/rulesEngine';
import { validateAndSanitize } from '@/modules/ai/qcFilter';
import { transformWithPersona, extractPersonaPrefs } from '@/modules/ai/persona';
import { ProfilesRepo } from '@/infrastructure/repositories/ProfilesRepo';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * POST /api/meal/feedback
 *
 * Generate 3-sentence feedback after meal logging:
 * 1. Summary (what was logged)
 * 2. 1-2 tips (based on rules)
 * 3. Conclusion (persona-based encouragement)
 *
 * Request body:
 * {
 *   "meal_log_id": "uuid" (optional - if provided, fetch meal data from DB)
 *   "items": [...] (optional - if no meal_log_id, use items directly)
 * }
 *
 * Response:
 * {
 *   "feedback": "3-sentence feedback string",
 *   "meta": { ... }
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = generateRequestId();

  try {
    const userId = await requireAuth(request);
    const body = await request.json();
    const { meal_log_id, items } = body;

    let mealData: MealData;

    // Fetch meal data from DB if meal_log_id provided
    if (meal_log_id) {
      const { data: mealLog } = await supabaseAdmin()
        .from('meal_logs')
        .select('items, carbs_g, protein_g, fat_g, kcal, meal_type, cooking_method')
        .eq('id', meal_log_id)
        .eq('user_id', userId)
        .maybeSingle();

      if (!mealLog) {
        throw new Error('Meal log not found');
      }

      mealData = {
        items: mealLog.items || [],
        kcal: mealLog.kcal,
        carb_g: mealLog.carbs_g,
        protein_g: mealLog.protein_g,
        fat_g: mealLog.fat_g,
        meal_type: mealLog.meal_type,
        cooking_method: mealLog.cooking_method
      };
    } else if (items && items.length > 0) {
      // Use items directly from request
      mealData = {
        items,
        kcal: items.reduce((sum: number, item: any) => sum + (item.kcal || 0), 0),
        carb_g: items.reduce((sum: number, item: any) => sum + (item.carb_g || 0), 0),
        protein_g: items.reduce((sum: number, item: any) => sum + (item.protein_g || 0), 0),
        fat_g: items.reduce((sum: number, item: any) => sum + (item.fat_g || 0), 0)
      };
    } else {
      throw new Error('Either meal_log_id or items must be provided');
    }

    // Fetch user features from Feature Store
    const featureRepo = new FeatureStoreRepo();
    const dailyFeatures = await featureRepo.getFeaturesWithFallback(userId);

    // Get latest BG
    const { data: bgData } = await supabaseAdmin()
      .from('glucose_logs')
      .select('value_mgdl')
      .eq('user_id', userId)
      .order('taken_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const userFeatures: UserFeatures = {
      carb_g_total_yesterday: dailyFeatures.carb_g_total,
      protein_g_total_yesterday: dailyFeatures.protein_g_total,
      fat_g_total_yesterday: dailyFeatures.fat_g_total,
      fried_count_7d: dailyFeatures.fried_count,
      latest_bg: bgData?.value_mgdl
    };

    // Generate feedback using rules
    let tip = generateMealTip(mealData, userFeatures);

    // Apply persona transformation
    const profilesRepo = new ProfilesRepo();
    const profile = await profilesRepo.getById(userId);
    const prefs = extractPersonaPrefs(profile?.prefs);
    tip = transformWithPersona(tip, prefs);

    // Format as 3-sentence feedback
    let feedback = formatTip(tip);

    // QC validation and sanitization
    const qcResult = validateAndSanitize(feedback);
    feedback = qcResult.sanitized;

    if (qcResult.violations.length > 0) {
      console.warn('QC violations in feedback:', qcResult.violations);
    }

    // Track event (fire-and-forget)
    trackTipShown(userId, requestId, {
      source: 'rule-based',
      length: feedback.length,
      suggestion_count: tip.suggestions.length
    }).catch(err => console.error('Failed to track feedback:', err));

    // Console log for monitoring
    console.info({
      request_id: requestId,
      source: 'rule-based',
      user_id: userId,
      feedback_length: feedback.length
    });

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      feedback,
      meta: {
        request_id: requestId,
        source: 'rule-based',
        length: feedback.length,
        time: new Date().toISOString(),
        response_time_ms: responseTime
      }
    });

  } catch (err: any) {
    console.error('Error in /api/meal/feedback:', err);

    // Fallback feedback
    const fallbackFeedback = 'Bữa ăn được ghi nhận. Cân bằng rau, đạm, tinh bột theo tỷ lệ 2:1:1. Tiếp tục duy trì nhé!';

    return NextResponse.json({
      feedback: fallbackFeedback,
      meta: {
        request_id: generateRequestId(),
        source: 'fallback',
        length: fallbackFeedback.length,
        time: new Date().toISOString(),
        error: err.message
      }
    }, { status: 200 });
  }
}
