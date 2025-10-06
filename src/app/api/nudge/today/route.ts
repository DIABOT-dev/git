/**
 * Proactive Nudge API - Get Today's Nudges
 *
 * GET /api/nudge/today
 * Returns list of valid nudges for current user, filtered by time window
 *
 * Feature flag: NUDGE_ENABLED (OFF by default for QA Freeze 0.9.0)
 * When OFF: Returns 404
 *
 * Time window: 06:00-21:00 (daytime)
 * Night mode: 21:00-06:00 (requires opt-in in user prefs)
 */

import { NextRequest, NextResponse } from 'next/server';
import { featureGate } from '@/lib/middleware/featureGate';

export async function GET(req: NextRequest) {
  // Feature gate: return 404 if NUDGE_ENABLED is OFF
  const gateResult = featureGate('NUDGE_ENABLED');
  if (gateResult) return gateResult;

  // Feature is enabled, proceed with logic
  try {
    // TODO: Implement actual logic
    // 1. Get current user from auth
    // 2. Check current time (06:00-21:00 or night opt-in)
    // 3. Check last log times (missing_log nudge)
    // 4. Check recent meals (post_meal_walk nudge)
    // 5. Check water intake (water_reminder nudge)
    // 6. Check BG safety (bg_check nudge, only if BG abnormal)
    // 7. Filter out already-shown nudges (within cooldown)
    // 8. Return max 2 nudges sorted by priority

    // Get current hour for time window check (stub)
    const now = new Date();
    const currentHour = now.getHours();
    const isDaytime = currentHour >= 6 && currentHour < 21;

    // Stub response with mock nudges
    const mockNudges = isDaytime ? [
      {
        id: 'nudge-1',
        type: 'missing_log',
        priority: 1,
        message: 'Ban chua nhap BG hom nay. Hay do ngay de theo doi suc khoe tot hon!',
        action: {
          label: 'Nhap ngay',
          route: '/log/bg',
        },
        dismissible: true,
      },
      {
        id: 'nudge-2',
        type: 'water_reminder',
        priority: 2,
        message: 'Ban moi uong 1200ml / 2000ml. Uong them 1 ly nuoc nhe!',
        action: {
          label: 'Da uong',
          route: '/log/water',
        },
        dismissible: true,
      },
    ] : [];

    return NextResponse.json({
      success: true,
      nudges: mockNudges,
      meta: {
        current_time: now.toISOString(),
        is_daytime: isDaytime,
        max_nudges: 2,
      },
    });
  } catch (error) {
    console.error('Error in /api/nudge/today:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
