/**
 * FamilyLink API - Relative Dashboard
 *
 * GET /api/relative/dashboard?user_id=uuid
 * Returns aggregated data for the specified user (if caller has access)
 *
 * Feature flag: RELATIVE_ENABLED (OFF by default for QA Freeze 0.9.0)
 * When OFF: Returns 404
 */

import { NextRequest, NextResponse } from 'next/server';
import { featureGate } from '@/lib/middleware/featureGate';

export async function GET(req: NextRequest) {
  // Feature gate: return 404 if RELATIVE_ENABLED is OFF
  const gateResult = featureGate('RELATIVE_ENABLED');
  if (gateResult) return gateResult;

  // Feature is enabled, proceed with logic
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing required parameter: user_id' },
        { status: 400 }
      );
    }

    // TODO: Implement actual logic
    // 1. Get current user from auth
    // 2. Check if current user can access user_id (via relatives table)
    // 3. Fetch BG, meal, water, BP, weight, insulin logs for user_id
    // 4. Aggregate data for dashboard view

    // Stub response with mock data
    return NextResponse.json({
      success: true,
      user_id,
      data: {
        glucose: {
          latest: 120,
          avg_7d: 118,
          readings: [],
        },
        meals: {
          today: 2,
          avg_calories: 1800,
          recent: [],
        },
        water: {
          today_ml: 1500,
          goal_ml: 2000,
          percentage: 75,
        },
        bp: {
          latest: { systolic: 120, diastolic: 80 },
          trend: 'normal',
        },
        weight: {
          latest_kg: 70,
          trend: 'stable',
        },
        insulin: {
          today_units: 24,
          doses: [],
        },
      },
    });
  } catch (error) {
    console.error('Error in /api/relative/dashboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
