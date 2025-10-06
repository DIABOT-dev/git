/**
 * FamilyLink API - Log on Behalf
 *
 * POST /api/relative/log/:type
 * Body: { user_id: uuid, ...logData }
 * Types: bg, meal, water, bp, weight, insulin
 *
 * Feature flag: RELATIVE_ENABLED (OFF by default for QA Freeze 0.9.0)
 * When OFF: Returns 404
 *
 * Requires 'editor' role in relatives table
 */

import { NextRequest, NextResponse } from 'next/server';
import { featureGate } from '@/lib/middleware/featureGate';

export async function POST(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  // Feature gate: return 404 if RELATIVE_ENABLED is OFF
  const gateResult = featureGate('RELATIVE_ENABLED');
  if (gateResult) return gateResult;

  // Feature is enabled, proceed with logic
  try {
    const { type } = params;
    const body = await req.json();
    const { user_id } = body;

    // Validate type
    const validTypes = ['bg', 'meal', 'water', 'bp', 'weight', 'insulin'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid log type. Must be one of: bg, meal, water, bp, weight, insulin' },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing required field: user_id' },
        { status: 400 }
      );
    }

    // TODO: Implement actual logic
    // 1. Get current user from auth (relative_id)
    // 2. Check if current user has 'editor' role for user_id
    // 3. Validate log data based on type
    // 4. Insert log with metadata (logged_by: relative_id)
    // 5. Emit event for audit trail

    // Stub response
    return NextResponse.json({
      success: true,
      message: `${type} log created on behalf (stub)`,
      data: {
        id: 'stub-log-uuid',
        user_id,
        type,
        logged_by: 'current-relative-id',
        created_at: new Date().toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error(`Error in /api/relative/log/${params.type}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
