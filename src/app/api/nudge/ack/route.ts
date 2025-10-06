/**
 * Proactive Nudge API - Acknowledge Nudge
 *
 * POST /api/nudge/ack
 * Body: { nudge_id: string, nudge_type: string, action: 'shown' | 'clicked' | 'dismissed' | 'applied' }
 *
 * Feature flag: NUDGE_ENABLED (OFF by default for QA Freeze 0.9.0)
 * When OFF: Returns 404
 *
 * Logs meta-only event (no PII)
 */

import { NextRequest, NextResponse } from 'next/server';
import { featureGate } from '@/lib/middleware/featureGate';

export async function POST(req: NextRequest) {
  // Feature gate: return 404 if NUDGE_ENABLED is OFF
  const gateResult = featureGate('NUDGE_ENABLED');
  if (gateResult) return gateResult;

  // Feature is enabled, proceed with logic
  try {
    const body = await req.json();
    const { nudge_id, nudge_type, action } = body;

    // Validate required fields
    if (!nudge_id || !nudge_type || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: nudge_id, nudge_type, action' },
        { status: 400 }
      );
    }

    // Validate nudge_type
    const validTypes = ['missing_log', 'post_meal_walk', 'water_reminder', 'bg_check'];
    if (!validTypes.includes(nudge_type)) {
      return NextResponse.json(
        { error: 'Invalid nudge_type' },
        { status: 400 }
      );
    }

    // Validate action
    const validActions = ['shown', 'clicked', 'dismissed', 'applied'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // TODO: Implement actual logic
    // 1. Get current user from auth (profile_id)
    // 2. Generate request_id for correlation
    // 3. Insert into nudge_events table (meta only, no PII)
    // 4. Return success

    // Stub response
    return NextResponse.json({
      success: true,
      message: 'Nudge event recorded (stub)',
      data: {
        id: 'event-uuid-stub',
        profile_id: 'current-user-id',
        nudge_id,
        nudge_type,
        action,
        request_id: `req-${Date.now()}`,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in /api/nudge/ack:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
