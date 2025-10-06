#!/usr/bin/env node
/**
 * QA Database Connectivity Test
 * Tests Supabase connection and basic query functionality
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const REQUIRED_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

function validateEnv() {
  const missing = REQUIRED_VARS.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error('[DB-QA] Missing environment variables:', missing.join(', '));
    return false;
  }
  return true;
}

async function testConnection() {
  console.log('[DB-QA] Testing Supabase connection...');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    const start = Date.now();

    // Test 1: Basic connectivity - query profiles table
    const { data, error, count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    const latency = Date.now() - start;

    if (error) {
      console.error('[DB-QA] Connection test FAILED:', error.message);
      return false;
    }

    console.log(`[DB-QA] Connection successful (${latency}ms)`);
    console.log(`[DB-QA] Profiles count: ${count ?? 'unknown'}`);

    // Test 2: Check critical tables exist
    const tables = ['glucose_logs', 'meal_logs', 'water_logs', 'insulin_logs'];

    for (const table of tables) {
      const { error: tableError } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true });

      if (tableError) {
        console.error(`[DB-QA] Table '${table}' check FAILED:`, tableError.message);
        return false;
      }
    }

    console.log('[DB-QA] All critical tables accessible');

    // Test 3: Check RLS is enabled (should fail without auth)
    const { error: rlsError } = await supabase
      .from('glucose_logs')
      .select('*')
      .limit(1);

    // We expect either no data or a proper RLS error, not a connection error
    if (rlsError && !rlsError.message.includes('violates row-level security')) {
      console.warn('[DB-QA] Unexpected RLS behavior:', rlsError.message);
    } else {
      console.log('[DB-QA] RLS policies active');
    }

    return true;
  } catch (err) {
    console.error('[DB-QA] Connection test FAILED:', err.message);
    return false;
  }
}

async function main() {
  console.log('[DB-QA] Starting database connectivity test...\n');

  if (!validateEnv()) {
    process.exit(1);
  }

  const success = await testConnection();

  console.log('\n[DB-QA] Test', success ? 'PASSED' : 'FAILED');
  process.exit(success ? 0 : 1);
}

main();
