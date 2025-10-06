// src/modules/ai/qcFilter.ts
// QC validation: forbidden words, length, tone

/**
 * Forbidden words list from DIABOT_CORE_DESIGN.md section 12
 */
const FORBIDDEN_WORDS = [
  'chữa khỏi',
  'thần dược',
  '100%',
  'khỏi hẳn',
  'điều trị',
  'đặc trị'
];

/**
 * Normalize Vietnamese text (remove diacritics) for matching
 */
function normalizeVietnamese(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Check if text contains forbidden words
 * Uses word boundaries and Unicode normalization
 */
export function containsForbiddenWords(text: string): boolean {
  const normalized = normalizeVietnamese(text);

  return FORBIDDEN_WORDS.some(word => {
    const normalizedWord = normalizeVietnamese(word);

    // Special case for "100%" - must be exact match
    if (word === '100%') {
      return /\b100%\b/.test(text);
    }

    // Use word boundary for other words
    const regex = new RegExp(`\\b${normalizedWord}\\b`, 'i');
    return regex.test(normalized);
  });
}

/**
 * Get list of forbidden words found in text
 * Uses word boundaries and Unicode normalization
 */
export function findForbiddenWords(text: string): string[] {
  const normalized = normalizeVietnamese(text);

  return FORBIDDEN_WORDS.filter(word => {
    const normalizedWord = normalizeVietnamese(word);

    // Special case for "100%"
    if (word === '100%') {
      return /\b100%\b/.test(text);
    }

    // Use word boundary
    const regex = new RegExp(`\\b${normalizedWord}\\b`, 'i');
    return regex.test(normalized);
  });
}

/**
 * Remove forbidden words from text (replace with safe alternative)
 * Uses word boundaries and handles Unicode normalization
 */
export function sanitizeForbiddenWords(text: string): string {
  let sanitized = text;

  const replacements: Record<string, string> = {
    'chữa khỏi': 'hỗ trợ kiểm soát',
    'thần dược': 'giải pháp hữu ích',
    '100%': 'hiệu quả',
    'khỏi hẳn': 'cải thiện',
    'điều trị': 'hỗ trợ',
    'đặc trị': 'phù hợp'
  };

  for (const [forbidden, safe] of Object.entries(replacements)) {
    // Escape special regex characters
    const escaped = forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    sanitized = sanitized.replace(regex, safe);
  }

  return sanitized;
}

/**
 * Enforce max length (≤800 chars)
 * Safe Unicode truncation - doesn't break multi-byte characters
 */
export function enforceMaxLength(text: string, maxLength: number = 800): string {
  // Count actual characters (not bytes)
  const chars = [...text]; // Spread to array of Unicode code points

  if (chars.length <= maxLength) return text;

  // Cut at maxLength - 3 (for '...')
  const cutChars = chars.slice(0, maxLength - 3);
  let cutText = cutChars.join('');

  // Try to cut at sentence boundary
  const lastPeriod = cutText.lastIndexOf('.');
  const lastSpace = cutText.lastIndexOf(' ');

  if (lastPeriod > maxLength * 0.8) {
    return cutText.substring(0, lastPeriod + 1);
  }

  // Cut at last space to avoid breaking words
  if (lastSpace > maxLength * 0.8) {
    return cutText.substring(0, lastSpace) + '...';
  }

  return cutText + '...';
}

/**
 * Full QC validation and sanitization
 */
export function validateAndSanitize(text: string): {
  isValid: boolean;
  sanitized: string;
  violations: string[];
} {
  const violations: string[] = [];
  let sanitized = text;

  // Check forbidden words
  const forbiddenFound = findForbiddenWords(sanitized);
  if (forbiddenFound.length > 0) {
    violations.push(`Forbidden words: ${forbiddenFound.join(', ')}`);
    sanitized = sanitizeForbiddenWords(sanitized);
  }

  // Check length
  if (sanitized.length > 800) {
    violations.push(`Length exceeded: ${sanitized.length} > 800`);
    sanitized = enforceMaxLength(sanitized, 800);
  }

  const isValid = violations.length === 0;

  return {
    isValid,
    sanitized,
    violations
  };
}

/**
 * Tone guard: check for negative/judgmental language
 */
export function checkTone(text: string): { acceptable: boolean; issues: string[] } {
  const issues: string[] = [];
  const lowerText = text.toLowerCase();

  const negativePatterns = [
    'sai',
    'tồi',
    'xấu',
    'không nên',
    'đừng',
    'nguy hiểm',
    'tai hại'
  ];

  for (const pattern of negativePatterns) {
    if (lowerText.includes(pattern)) {
      issues.push(pattern);
    }
  }

  // Allow some negative words in safety context
  const hasSafetyContext = lowerText.includes('gặp bác sĩ') ||
                           lowerText.includes('cơ sở y tế') ||
                           lowerText.includes('khám ngay');

  const acceptable = issues.length === 0 || hasSafetyContext;

  return { acceptable, issues };
}
