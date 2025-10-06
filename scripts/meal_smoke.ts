#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const DEBUG_USER_ID = 'a9d5518d-ee4c-49ca-8b20-5a2d4aaa16a2';

console.log('🍽️ MEAL LOGGING SMOKE TEST');
console.log('===========================');

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    console.log(`\n${passed + failed + 1}️⃣ ${name}...`);
    await fn();
    console.log(`✅ PASS - ${name}`);
    passed++;
  } catch (error: any) {
    console.log(`❌ FAIL - ${name}: ${error.message}`);
    failed++;
  }
}

async function fetchWithAuth(path: string, options: any = {}) {
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-debug-user-id': DEBUG_USER_ID,
      ...options.headers,
    },
  });
}

async function runTests() {
  // Test 1: Health check
  await test('Health check', async () => {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
    const data = await response.json();
    if (!data.ok) throw new Error('Health check returned ok: false');
  });

  // Test 2: Old endpoint should return 404
  await test('Old /api/meal endpoint returns 404', async () => {
    const response = await fetchWithAuth('/api/meal', { method: 'POST', body: JSON.stringify({ text: 'test' }) });
    if (response.status !== 404) throw new Error(`Expected 404, got ${response.status}`);
  });

  // Test 3: POST /api/log/meal with only text
  await test('POST /api/log/meal with only text', async () => {
    const payload = {
      text: 'Cơm gà hấp',
      portion: 'medium'
    };
    const response = await fetchWithAuth('/api/log/meal', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Expected 201, got ${response.status}: ${JSON.stringify(error)}`);
    }
    
    const data = await response.json();
    if (!data.ok || !data.data) throw new Error('Response missing ok or data field');
    if (!data.data.items || !Array.isArray(data.data.items)) throw new Error('Response missing items array');
    if (!data.data.items[0] || !data.data.items[0].name) throw new Error('items[0].name not found');
    if (data.data.items[0].imageUrl) throw new Error('items[0].imageUrl should not exist for text-only');
  });

  // Test 4: POST /api/log/meal with only image_url
  await test('POST /api/log/meal with only image_url', async () => {
    const payload = {
      image_url: 'https://example.com/meal.jpg',
      portion: 'low'
    };
    const response = await fetchWithAuth('/api/log/meal', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Expected 201, got ${response.status}: ${JSON.stringify(error)}`);
    }
    
    const data = await response.json();
    if (!data.ok || !data.data) throw new Error('Response missing ok or data field');
    if (!data.data.items || !Array.isArray(data.data.items)) throw new Error('Response missing items array');
    if (!data.data.items[0] || !data.data.items[0].imageUrl) throw new Error('items[0].imageUrl not found');
    if (data.data.items[0].name) throw new Error('items[0].name should not exist for image-only');
  });

  // Test 5: POST /api/log/meal with both text and image_url
  await test('POST /api/log/meal with text + image_url', async () => {
    const payload = {
      text: 'Salad rau củ',
      image_url: 'https://example.com/salad.jpg',
      portion: 'high',
      meal_type: 'lunch'
    };
    const response = await fetchWithAuth('/api/log/meal', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Expected 201, got ${response.status}: ${JSON.stringify(error)}`);
    }
    
    const data = await response.json();
    if (!data.ok || !data.data) throw new Error('Response missing ok or data field');
    if (!data.data.items || !Array.isArray(data.data.items)) throw new Error('Response missing items array');
    if (!data.data.items[0] || !data.data.items[0].name || !data.data.items[0].imageUrl) {
      throw new Error('items[0] missing name or imageUrl for combined payload');
    }
  });

  // Test 6: POST /api/log/meal without text and image_url (should fail)
  await test('POST /api/log/meal without text and image_url returns 400', async () => {
    const payload = {
      portion: 'medium'
    };
    const response = await fetchWithAuth('/api/log/meal', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    if (response.status !== 400) {
      throw new Error(`Expected 400, got ${response.status}`);
    }
    
    const data = await response.json();
    if (data.ok !== false) throw new Error('Expected ok: false for validation error');
  });

  // Test 7: Unauthorized request returns 401
  await test('Unauthorized request returns 401', async () => {
    const payload = {
      text: 'Unauthorized test',
      portion: 'medium'
    };
    const response = await fetch(`${BASE_URL}/api/log/meal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (response.status !== 401) {
      throw new Error(`Expected 401, got ${response.status}`);
    }
  });
}

async function main() {
  try {
    await runTests();
    
    console.log('\n📊 MEAL SMOKE TEST SUMMARY');
    console.log('===========================');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n⚠️ Some tests failed. Please review the errors above.');
      process.exit(1);
    } else {
      console.log('\n🎉 ALL MEAL TESTS PASSED');
      process.exit(0);
    }
  } catch (error) {
    console.error('Unexpected error during meal smoke test:', error);
    process.exit(1);
  }
}

main().catch(console.error);