#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const GATEWAY = `${BASE_URL}/api/ai/gateway`;

interface TestCase {
  intent: string;
  message: string;
}

async function runBatch() {
  console.log('🚀 AI GATEWAY BATCH TEST (MOCK MODE)');
  console.log('=====================================');

  // Load test cases
  const casesPath = join(process.cwd(), 'scripts/cases.json');
  const cases: TestCase[] = JSON.parse(readFileSync(casesPath, 'utf8'));

  console.log(`📋 Running ${cases.length} test cases...\n`);

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < cases.length; i++) {
    const testCase = cases[i];
    const caseId = `case-${i + 1}`;
    
    console.log(`${i + 1}️⃣ Testing: ${testCase.intent} - "${testCase.message}"`);

    try {
      const response = await fetch(GATEWAY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': caseId
        },
        body: JSON.stringify({
          user_id: 'demo',
          intent: testCase.intent,
          message: testCase.message
        })
      });

      const data = await response.json();

      if (response.ok && data.output) {
        console.log(`✅ PASS - Output: ${data.output.slice(0, 80)}...`);
        console.log(`   Safety: ${data.safety}, Tokens: ${data.tokens}, Model: ${data.model}`);
        passed++;
      } else {
        console.log(`❌ FAIL - Status: ${response.status}, Error: ${data.error || 'Unknown'}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ FAIL - Network error: ${error}`);
      failed++;
    }

    console.log(''); // Empty line between cases
  }

  console.log('📊 BATCH TEST SUMMARY');
  console.log('=====================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / cases.length) * 100).toFixed(1)}%`);

  if (failed > 0) {
    process.exit(1);
  }
}

runBatch().catch(console.error);