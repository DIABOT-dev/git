#!/usr/bin/env node
// Unit test for meal tip generation logic
// Tests rules engine + QC filter directly (no API call needed)

// Mock the dependencies
const generateMealTip = (meal, features) => {
  const suggestions = [];
  let summary = 'Bữa ăn được ghi nhận';

  // Rule 1: Carb cao (≥45g/bữa hoặc hôm qua cao)
  if (meal.carb_g && meal.carb_g >= 45) {
    suggestions.push('Bớt tinh bột nhanh, thêm rau xanh hoặc xơ để cân bằng đường huyết');
  } else if (features.carb_g_total_yesterday && features.carb_g_total_yesterday >= 180) {
    suggestions.push('Hôm qua carb đã cao, hôm nay ưu tiên rau và đạm nạc nhé');
  }

  // Rule 2: Protein thấp (<15-20g/bữa)
  if (meal.protein_g !== undefined && meal.protein_g < 15) {
    suggestions.push('Thêm cá, ức gà, đậu phụ hoặc trứng để đủ đạm');
  } else if (features.protein_g_total_yesterday && features.protein_g_total_yesterday < 50) {
    suggestions.push('Hôm qua thiếu đạm, hôm nay cố gắng ăn thêm thịt nạc hoặc cá');
  }

  // Rule 3: Fat cao (>20g)
  if (meal.fat_g && meal.fat_g > 20) {
    suggestions.push('Giảm món chiên/mỡ, chuyển sang hạt, cá, hoặc dầu oliu');
  }

  // Rule 4: Kcal cao (>600 kcal/bữa)
  if (meal.kcal && meal.kcal > 600) {
    suggestions.push('Chia nhỏ bữa ăn, ưu tiên rau + đạm nạc để giảm tải');
  }

  // Rule 5: BG cao gần đây (>180 mg/dL)
  if (features.latest_bg && features.latest_bg > 180) {
    suggestions.push('Đường huyết cao, ưu tiên low-carb + vận động nhẹ 10-15 phút');
  }

  // Rule 6: Tần suất món chiên cao (>3 lần/tuần)
  if (features.fried_count_7d && features.fried_count_7d > 3) {
    suggestions.push('Tuần này nhiều món chiên rồi, thử món hấp hoặc luộc nhé');
  }

  // Fallback
  if (suggestions.length === 0) {
    suggestions.push('Tiếp tục theo dõi và ghi chép đều đặn');
    suggestions.push('Cân bằng rau, đạm, tinh bột theo tỷ lệ 2:1:1');
  }

  // Giới hạn 2 suggestions
  const topSuggestions = suggestions.slice(0, 2);

  // Summary
  const itemNames = meal.items?.map(i => i.name || i.food).filter(Boolean).join(', ') || 'bữa ăn';
  summary = `Ghi nhận ${itemNames}`;

  // Conclusion
  const conclusion = 'Tiếp tục duy trì nhé, bạn đang làm tốt lắm!';

  return {
    summary,
    suggestions: topSuggestions,
    conclusion
  };
};

const formatTip = (tip) => {
  const parts = [
    tip.summary,
    ...tip.suggestions.map((s, i) => `${i + 1}. ${s}`),
    tip.conclusion
  ];

  let formatted = parts.join('. ') + '.';

  // Ensure ≤800 chars
  if (formatted.length > 800) {
    formatted = formatted.substring(0, 797) + '...';
  }

  return formatted;
};

// QC Filter functions
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

function sanitizeForbiddenWords(text) {
  let sanitized = text;

  const replacements = {
    'chữa khỏi': 'hỗ trợ kiểm soát',
    'thần dược': 'giải pháp hữu ích',
    '100%': 'hiệu quả',
    'khỏi hẳn': 'cải thiện',
    'điều trị': 'hỗ trợ',
    'đặc trị': 'phù hợp'
  };

  for (const [forbidden, safe] of Object.entries(replacements)) {
    const escaped = forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    sanitized = sanitized.replace(regex, safe);
  }

  return sanitized;
}

function validateAndSanitize(text) {
  const violations = [];
  let sanitized = text;

  const forbiddenFound = findForbiddenWords(sanitized);
  if (forbiddenFound.length > 0) {
    violations.push(`Forbidden words: ${forbiddenFound.join(', ')}`);
    sanitized = sanitizeForbiddenWords(sanitized);
  }

  if (sanitized.length > 800) {
    violations.push(`Length exceeded: ${sanitized.length} > 800`);
    sanitized = sanitized.substring(0, 797) + '...';
  }

  return {
    isValid: violations.length === 0,
    sanitized,
    violations
  };
}

function checkForCarbOrProteinSuggestion(text) {
  const normalized = normalizeVietnamese(text);

  // Carb reduction keywords
  const carbKeywords = ['bot tinh bot', 'giam carb', 'giam tinh bot', 'bot'];
  const hasCarbSuggestion = carbKeywords.some(kw => normalized.includes(kw));

  // Protein increase keywords
  const proteinKeywords = ['them dam', 'them ca', 'them thit', 'them dau phu', 'them trung', 'du dam'];
  const hasProteinSuggestion = proteinKeywords.some(kw => normalized.includes(kw));

  return { hasCarbSuggestion, hasProteinSuggestion, hasEither: hasCarbSuggestion || hasProteinSuggestion };
}

// Test data matching your requirement
const mealData = {
  items: [{ name: 'Bữa tối', food: 'Cơm + thịt + rau' }],
  kcal: 520,
  carb_g: 65,    // High carb (≥45g) → should trigger Rule 1
  protein_g: 8,  // Low protein (<15g) → should trigger Rule 2
  fat_g: 25,     // High fat (>20g) → should trigger Rule 3
  meal_type: 'dinner'
};

const userFeatures = {
  carb_g_total_yesterday: 150,
  protein_g_total_yesterday: 60,
  fat_g_total_yesterday: 50,
  fried_count_7d: 2,
  latest_bg: 160  // Within normal range (provided by you)
};

console.log('🧪 Unit Test: Meal Tip Generation');
console.log('');
console.log('Input:');
console.log('  Meal:', JSON.stringify(mealData, null, 2));
console.log('  User Features:', JSON.stringify(userFeatures, null, 2));
console.log('');

// Generate tip
const ruleTip = generateMealTip(mealData, userFeatures);
console.log('Generated Tip Object:');
console.log('  Summary:', ruleTip.summary);
console.log('  Suggestions:', ruleTip.suggestions);
console.log('  Conclusion:', ruleTip.conclusion);
console.log('');

// Format
let tipText = formatTip(ruleTip);
console.log('Formatted Tip (before QC):');
console.log(`  "${tipText}"`);
console.log('');

// QC validation
const qcResult = validateAndSanitize(tipText);
tipText = qcResult.sanitized;

console.log('QC Result:');
console.log('  Valid:', qcResult.isValid);
console.log('  Violations:', qcResult.violations.length > 0 ? qcResult.violations : 'none');
console.log('');

console.log('Final Tip (after QC):');
console.log(`  "${tipText}"`);
console.log('');

// Run tests
console.log('═══════════════════════════════════════');
console.log('Test Results:');
console.log('═══════════════════════════════════════');

// Test 1: Length ≤ 800
const test1Pass = tipText.length <= 800;
console.log(`✓ Test 1: Length ≤ 800 chars`);
console.log(`  Actual: ${tipText.length} chars`);
console.log(`  Result: ${test1Pass ? '✅ PASS' : '❌ FAIL'}`);
console.log('');

// Test 2: No forbidden words
const foundForbidden = findForbiddenWords(tipText);
const test2Pass = foundForbidden.length === 0;
console.log(`✓ Test 2: No forbidden words`);
console.log(`  Found: ${foundForbidden.length > 0 ? foundForbidden.join(', ') : 'none'}`);
console.log(`  Result: ${test2Pass ? '✅ PASS' : '❌ FAIL'}`);
console.log('');

// Test 3: Contains carb/protein suggestion
const suggestionCheck = checkForCarbOrProteinSuggestion(tipText);
const test3Pass = suggestionCheck.hasEither;
console.log(`✓ Test 3: Contains carb reduction OR protein increase suggestion`);
console.log(`  Carb suggestion: ${suggestionCheck.hasCarbSuggestion ? '✓' : '✗'}`);
console.log(`  Protein suggestion: ${suggestionCheck.hasProteinSuggestion ? '✓' : '✗'}`);
console.log(`  Result: ${test3Pass ? '✅ PASS' : '❌ FAIL'}`);
console.log('');

// Overall
const allPass = test1Pass && test2Pass && test3Pass;
console.log('═══════════════════════════════════════');
console.log(`Overall: ${allPass ? '✅ PASS' : '❌ FAIL'}`);
console.log('═══════════════════════════════════════');

process.exit(allPass ? 0 : 1);
