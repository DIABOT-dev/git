/**
 * FamilyLink API - Add Relative
 *
 * POST /api/relative/add
 * Body: { relative_id: uuid, relation_type: string, role: 'viewer' | 'editor' }
 *
 * Feature flag: RELATIVE_ENABLED (OFF by default for QA Freeze 0.9.0)
 * When OFF: Returns 404
 */

import { NextRequest, NextResponse } from 'next/server';
import { featureGate } from '@/lib/middleware/featureGate';

export async function POST(req: NextRequest) {
  // Feature gate: return 404 if RELATIVE_ENABLED is OFF
  const gateResult = featureGate('RELATIVE_ENABLED');
  if (gateResult) return gateResult;

  // Feature is enabled, proceed with logic
  try {
    const body = await req.json();
    const { relative_id, relation_type, role } = body;

    // Validation stub
    if (!relative_id || !relation_type || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: relative_id, relation_type, role' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['viewer', 'editor'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be viewer or editor' },
        { status: 400 }
      );
    }

    // Validate relation_type
    const validRelations = ['father', 'mother', 'son', 'daughter', 'spouse', 'sibling', 'other'];
    if (!validRelations.includes(relation_type)) {
      return NextResponse.json(
        { error: 'Invalid relation_type' },
        { status: 400 }
      );
    }

    // TODO: Implement actual logic
    // 1. Get user_id from auth
    // 2. Check relative_id exists in profiles
    // 3. Insert into relatives table
    // 4. Return success

    // Stub response
    return NextResponse.json({
      success: true,
      message: 'Relative link created (stub)',
      data: {
        id: 'stub-uuid',
        user_id: 'current-user-id',
        relative_id,
        relation_type,
        role,
        created_at: new Date().toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error in /api/relative/add:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
