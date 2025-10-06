import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/getUserId';
import { generateRequestId, trackPreferenceChanged } from '@/lib/analytics/eventTracker';
import { ProfilesRepo } from '@/infrastructure/repositories/ProfilesRepo';
import { extractPersonaPrefs, type PersonaPrefs } from '@/modules/ai/persona';
import { z } from 'zod';
export const dynamic = 'force-dynamic';

/**
 * PUT /api/profile/personality
 *
 * Update user's AI persona preferences
 *
 * Request body:
 * {
 *   "ai_persona": "friend" | "coach" | "advisor",
 *   "guidance_level": "minimal" | "detailed",
 *   "low_ask_mode": boolean
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "prefs": { ... updated prefs ... },
 *   "meta": { ... }
 * }
 */

const prefsSchema = z.object({
  ai_persona: z.enum(['friend', 'coach', 'advisor']).optional(),
  guidance_level: z.enum(['minimal', 'detailed']).optional(),
  low_ask_mode: z.boolean().optional()
});

export async function PUT(request: NextRequest) {
  const startTime = Date.now();
  const requestId = generateRequestId();

  try {
    const userId = await requireAuth(request);
    const body = await request.json();

    // Validate input
    const validation = prefsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid preferences',
        details: validation.error.flatten()
      }, { status: 400 });
    }

    const updates = validation.data;

    // Fetch current profile
    const profilesRepo = new ProfilesRepo();
    const profile = await profilesRepo.getById(userId);

    if (!profile) {
      return NextResponse.json({
        error: 'Profile not found'
      }, { status: 404 });
    }

    // Extract current prefs
    const currentPrefs = extractPersonaPrefs(profile.prefs);

    // Merge with updates
    const newPrefs: PersonaPrefs = {
      ai_persona: updates.ai_persona ?? currentPrefs.ai_persona,
      guidance_level: updates.guidance_level ?? currentPrefs.guidance_level,
      low_ask_mode: updates.low_ask_mode ?? currentPrefs.low_ask_mode
    };

    // Update profile
    const updatedProfile = await profilesRepo.update(userId, {
      prefs: newPrefs as any
    });

    // Track preference changes
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && value !== (currentPrefs as any)[key]) {
        trackPreferenceChanged(userId, requestId, {
          preference_key: key,
          old_value: (currentPrefs as any)[key],
          new_value: value
        }).catch(err => console.error('Failed to track preference change:', err));
      }
    }

    // Console log for monitoring
    console.info({
      request_id: requestId,
      user_id: userId,
      updates,
      response_time_ms: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      prefs: newPrefs,
      meta: {
        request_id: requestId,
        time: new Date().toISOString(),
        response_time_ms: Date.now() - startTime
      }
    });

  } catch (err: any) {
    console.error('Error in /api/profile/personality:', err);

    return NextResponse.json({
      error: 'Failed to update preferences',
      message: err.message
    }, { status: 500 });
  }
}

/**
 * GET /api/profile/personality
 *
 * Get user's current AI persona preferences
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth(request);

    const profilesRepo = new ProfilesRepo();
    const profile = await profilesRepo.getById(userId);

    if (!profile) {
      return NextResponse.json({
        error: 'Profile not found'
      }, { status: 404 });
    }

    const prefs = extractPersonaPrefs(profile.prefs);

    return NextResponse.json({
      prefs,
      meta: {
        time: new Date().toISOString()
      }
    });

  } catch (err: any) {
    console.error('Error in GET /api/profile/personality:', err);

    return NextResponse.json({
      error: 'Failed to get preferences',
      message: err.message
    }, { status: 500 });
  }
}
