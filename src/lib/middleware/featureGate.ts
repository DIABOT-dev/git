/**
 * Feature Gate Middleware
 *
 * Protects API routes behind feature flags.
 * When flag is OFF: returns 404
 * When flag is ON: allows request to proceed
 *
 * Usage:
 * ```ts
 * export async function GET(req: Request) {
 *   const gateResult = await featureGate('RELATIVE_ENABLED');
 *   if (gateResult) return gateResult;
 *
 *   // Feature is enabled, proceed with logic
 *   return Response.json({ data: 'ok' });
 * }
 * ```
 */

import { NextResponse } from 'next/server';
import { getFeatureFlag, type FlagKey } from '../../../config/feature-flags';

/**
 * Check if a feature is enabled. If not, return 404 response.
 * If enabled, return null (allowing the request to proceed).
 */
export function featureGate(flagKey: FlagKey): NextResponse | null {
  const isEnabled = getFeatureFlag(flagKey);

  // For boolean flags, check truthy value
  if (typeof isEnabled === 'boolean' && !isEnabled) {
    return NextResponse.json(
      {
        error: 'Feature not available',
        code: 'FEATURE_DISABLED',
        flag: flagKey,
      },
      { status: 404 }
    );
  }

  // For string flags (like AI_AGENT_MODE), check if it's 'off'
  if (typeof isEnabled === 'string' && isEnabled === 'off') {
    return NextResponse.json(
      {
        error: 'Feature not available',
        code: 'FEATURE_DISABLED',
        flag: flagKey,
      },
      { status: 404 }
    );
  }

  // Feature is enabled, allow request to proceed
  return null;
}

/**
 * Async version that checks database flags (future enhancement)
 */
export async function featureGateAsync(flagKey: FlagKey): Promise<NextResponse | null> {
  // For now, just use the sync version
  // In future, this can check database-backed flags
  return featureGate(flagKey);
}

/**
 * Check multiple flags (AND logic - all must be enabled)
 */
export function featureGateAll(...flagKeys: FlagKey[]): NextResponse | null {
  for (const key of flagKeys) {
    const result = featureGate(key);
    if (result) return result; // Return first failing gate
  }
  return null; // All gates passed
}

/**
 * Check multiple flags (OR logic - at least one must be enabled)
 */
export function featureGateAny(...flagKeys: FlagKey[]): NextResponse | null {
  let allDisabled = true;

  for (const key of flagKeys) {
    const result = featureGate(key);
    if (!result) {
      allDisabled = false;
      break;
    }
  }

  if (allDisabled) {
    return NextResponse.json(
      {
        error: 'Feature not available',
        code: 'ALL_FEATURES_DISABLED',
        flags: flagKeys,
      },
      { status: 404 }
    );
  }

  return null; // At least one gate passed
}
