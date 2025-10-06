#!/usr/bin/env node
// Test /api/ai/meal-tip endpoint
// Requirements:
// 1. Response ≤ 800 chars
// 2. No forbidden words (chữa khỏi, thần dược, 100%, khỏi hẳn, điều trị, đặc trị)
// 3. Contains suggestion about reducing carbs OR adding protein (based on input)

import { config } from 'dotenv';
config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test payload matching your requirement
const testPayload = {
  // Adjusted to match expected API format: items array
  items: [
    {
      name: 'Bữa tối',
      food: 'Cơm + thịt + rau',
      kcal: 520,
      carb_g: 65,
      protein_g: 8,
      fat_g: 25
    }
  ]
};

// Forbidden words from qcFilter.ts
const FORBIDDEN_WORDS = [
  'chữa khỏi',
  'thần dược',
  '100%',
  'khỏi hẳn',
  'điều trị',
  'đặc trị'
];

function normalizeVietnamese(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function containsForbiddenWords(text) {
  const normalized = normalizeVietnamese(text);

  return FORBIDDEN_WORDS.some(word => {
    const normalizedWord = normalizeVietnamese(word);

    if (word === '100%') {
      return /\b100%\b/.test(text);
    }

    const regex = new RegExp(`\\b${normalizedWord}\\b`, 'i');
    return regex.test(normalized);
  });
}

function findForbiddenWords(text) {
  const normalized = normalizeVietnamese(text);

  return FORBIDDEN_WORDS.filter(word => {
    const normalizedWord = normalizeVietnamese(word);

    if (word === '100%') {
      return /\b100%\b/.test(text);
    }

    const regex = new RegExp(`\\b${normalizedWord}\\b`, 'i');
    return regex.test(normalized);
  });
}

function checkForCarbOrProteinSuggestion(text) {
  const normalized = normalizeVietnamese(text);

  // Check for carb reduction keywords
  const carbKeywords = ['bot tinh bot', 'giam carb', 'giam tinh bot'];
  const hasCarbSuggestion = carbKeywords.some(kw => normalized.includes(kw));

  // Check for protein increase keywords
  const proteinKeywords = ['them dam', 'them ca', 'them thit', 'them dau phu', 'them trung'];
  const hasProteinSuggestion = proteinKeywords.some(kw => normalized.includes(kw));

  return hasCarbSuggestion || hasProteinSuggestion;
}

async function runTest() {
  console.log('🧪 Testing /api/ai/meal-tip');
  console.log('Input:', JSON.stringify(testPayload, null, 2));
  console.log('');

  // Get token from file (if exists)
  let token = null;
  try {
    const fs = await import('fs');
    token = fs.readFileSync('./token.txt', 'utf-8').trim();
  } catch (err) {
    console.warn('⚠️  No token.txt found, using anonymous request');
  }

  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/ai/meal-tip`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testPayload)
    });

    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('');

    if (response.status !== 200) {
      console.log('❌ FAIL: Expected status 200');
      return;
    }

    const tip = data.tip || '';

    // Test 1: Length ≤ 800 chars
    const test1Pass = tip.length <= 800;
    console.log(`✓ Test 1: Length ≤ 800 chars`);
    console.log(`  Actual: ${tip.length} chars`);
    console.log(`  Result: ${test1Pass ? '✅ PASS' : '❌ FAIL'}`);
    console.log('');

    // Test 2: No forbidden words
    const foundForbidden = findForbiddenWords(tip);
    const test2Pass = foundForbidden.length === 0;
    console.log(`✓ Test 2: No forbidden words`);
    console.log(`  Found: ${foundForbidden.length > 0 ? foundForbidden.join(', ') : 'none'}`);
    console.log(`  Result: ${test2Pass ? '✅ PASS' : '❌ FAIL'}`);
    console.log('');

    // Test 3: Contains carb/protein suggestion
    const test3Pass = checkForCarbOrProteinSuggestion(tip);
    console.log(`✓ Test 3: Contains carb reduction OR protein increase suggestion`);
    console.log(`  Result: ${test3Pass ? '✅ PASS' : '❌ FAIL'}`);
    console.log('');

    // Overall result
    const allPass = test1Pass && test2Pass && test3Pass;
    console.log('═══════════════════════════════════════');
    console.log(`Overall: ${allPass ? '✅ PASS' : '❌ FAIL'}`);
    console.log('═══════════════════════════════════════');

    // Debug output if fail
    if (!allPass) {
      console.log('');
      console.log('🔍 Debug: Full tip content:');
      console.log(tip);
    }

  } catch (err) {
    console.error('❌ FAIL: Request error');
    console.error(err.message);
  }
}

runTest();
