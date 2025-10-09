#!/usr/bin/env node
// scripts/verify_env_fix.mjs - Static verification of ENV fix (no server needed)

import { readFileSync } from 'fs';
import { resolve } from 'path';

const checks = [];

function check(name, condition, details = '') {
  checks.push({ name, pass: condition, details });
  const status = condition ? '✅' : '❌';
  console.log(`${status} ${name}`);
  if (details) console.log(`   ${details}`);
}

console.log('=== ENV Fix Verification (Static Analysis) ===\n');

// Check 1: All log endpoints use supabaseAdmin
console.log('1. Log Endpoints Import Check:');
const logEndpoints = [
  'src/app/api/log/bg/route.ts',
  'src/app/api/log/bp/route.ts',
  'src/app/api/log/water/route.ts',
  'src/app/api/log/meal/route.ts',
  'src/app/api/log/insulin/route.ts',
  'src/app/api/log/weight/route.ts'
];

let allImportsCorrect = true;
for (const endpoint of logEndpoints) {
  try {
    const content = readFileSync(endpoint, 'utf-8');
    const hasCorrectImport = content.includes("from '@/lib/supabase/admin'") ||
                             content.includes('from "@/lib/supabase/admin"');
    const usesFunction = content.includes('supabaseAdmin()');

    if (hasCorrectImport && usesFunction) {
      console.log(`   ✅ ${endpoint.split('/').pop()}`);
    } else {
      console.log(`   ❌ ${endpoint.split('/').pop()} - Missing correct import or usage`);
      allImportsCorrect = false;
    }
  } catch (err) {
    console.log(`   ⚠️  ${endpoint.split('/').pop()} - File not found`);
    allImportsCorrect = false;
  }
}
check('All 6 log endpoints use supabaseAdmin', allImportsCorrect, '');

// Check 2: admin.ts uses correct ENV variable
console.log('\n2. Admin Client ENV Variables:');
try {
  const adminContent = readFileSync('src/lib/supabase/admin.ts', 'utf-8');
  const usesServiceRoleKey = adminContent.includes('SUPABASE_SERVICE_ROLE_KEY');
  const noOldServiceRole = !adminContent.includes('SUPABASE_SERVICE_ROLE;') &&
                           !adminContent.includes("SUPABASE_SERVICE_ROLE'");

  check('Uses SUPABASE_SERVICE_ROLE_KEY', usesServiceRoleKey);
  check('No old SUPABASE_SERVICE_ROLE reference', noOldServiceRole);
} catch (err) {
  check('Admin client check', false, 'File not found');
}

// Check 3: .env file has all required variables
console.log('\n3. Environment Variables:');
try {
  const envContent = readFileSync('.env', 'utf-8');
  const hasSupabaseUrl = /^SUPABASE_URL=/m.test(envContent);
  const hasServiceRoleKey = /^SUPABASE_SERVICE_ROLE_KEY=/m.test(envContent);
  const hasPublicUrl = /^NEXT_PUBLIC_SUPABASE_URL=/m.test(envContent);
  const hasAnonKey = /^NEXT_PUBLIC_SUPABASE_ANON_KEY=/m.test(envContent);

  check('SUPABASE_URL present', hasSupabaseUrl);
  check('SUPABASE_SERVICE_ROLE_KEY present', hasServiceRoleKey);
  check('NEXT_PUBLIC_SUPABASE_URL present', hasPublicUrl);
  check('NEXT_PUBLIC_SUPABASE_ANON_KEY present', hasAnonKey);

  const allVarsPresent = hasSupabaseUrl && hasServiceRoleKey && hasPublicUrl && hasAnonKey;
  check('All 4 required variables present', allVarsPresent, '');
} catch (err) {
  check('.env file check', false, 'File not found');
}

// Check 4: .gitignore protects .env files
console.log('\n4. Git Protection:');
try {
  const gitignoreContent = readFileSync('.gitignore', 'utf-8');
  const protectsEnv = gitignoreContent.includes('.env');
  const preservesExample = gitignoreContent.includes('!.env.local.example');

  check('.gitignore protects .env files', protectsEnv);
  check('Preserves .env.local.example', preservesExample);
} catch (err) {
  check('.gitignore check', false, 'File not found');
}

// Check 5: No anon key fallback in server contexts
console.log('\n5. Server Context Security:');
try {
  const serverClientContent = readFileSync('src/lib/supabase/serverClient.ts', 'utf-8');
  const noAnonFallback = !serverClientContent.includes('process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY');

  check('No anon key fallback in serverClient', noAnonFallback,
        noAnonFallback ? 'Server always uses service role key' : 'WARNING: Anon key fallback found');
} catch (err) {
  check('Server context check', false, 'File not found');
}

// Check 6: buildUserContext uses correct pattern
console.log('\n6. User Context Builder:');
try {
  const contextContent = readFileSync('src/application/services/buildUserContext.ts', 'utf-8');
  const usesServiceRoleKey = contextContent.includes('SUPABASE_SERVICE_ROLE_KEY');
  const hasErrorCheck = contextContent.includes('throw new Error');

  check('buildUserContext uses service role key', usesServiceRoleKey);
  check('Has error validation', hasErrorCheck);
} catch (err) {
  check('User context check', false, 'File not found');
}

// Summary
console.log('\n=== Summary ===');
const totalChecks = checks.length;
const passedChecks = checks.filter(c => c.pass).length;
const failedChecks = totalChecks - passedChecks;

console.log(`Total Checks: ${totalChecks}`);
console.log(`Passed: ${passedChecks}`);
console.log(`Failed: ${failedChecks}`);

if (failedChecks === 0) {
  console.log('\n🎉 All checks passed! ENV fix is verified.');
  console.log('\n✅ Next step: Test endpoints with: node scripts/test_6_logs.mjs');
  console.log('   (Requires dev server: npm run dev)');
  process.exit(0);
} else {
  console.log('\n⚠️  Some checks failed. Review errors above.');
  process.exit(1);
}
