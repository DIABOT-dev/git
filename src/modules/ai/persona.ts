// src/modules/ai/persona.ts
// Persona template system (Friend/Coach/Advisor)

import { RuleTip } from './rulesEngine';

export type PersonaType = 'friend' | 'coach' | 'advisor';
export type GuidanceLevel = 'minimal' | 'detailed';

export interface PersonaPrefs {
  ai_persona?: PersonaType;
  guidance_level?: GuidanceLevel;
  low_ask_mode?: boolean;
}

/**
 * Apply persona tone to meal tip
 * Friend: "mình – bạn", ấm áp, khen trước, gợi ý nhẹ
 * Coach: "tôi – bạn", mục tiêu rõ, gợi ý thực tế
 * Advisor: "tôi – anh/chị", ngắn gọn, chuyên nghiệp
 */
export function applyPersona(tip: RuleTip, persona: PersonaType = 'friend'): RuleTip {
  switch (persona) {
    case 'friend':
      return applyFriendTone(tip);
    case 'coach':
      return applyCoachTone(tip);
    case 'advisor':
      return applyAdvisorTone(tip);
    default:
      return tip;
  }
}

/**
 * Friend persona: casual, warm, encouraging
 */
function applyFriendTone(tip: RuleTip): RuleTip {
  const conclusions = [
    'Cứ thoải mái nhé, mình cùng bạn theo dõi!',
    'Bạn đang làm tốt lắm, tiếp tục nhé!',
    'Mình luôn ở đây hỗ trợ bạn!',
    'Từng bước một thôi, bạn nhé!'
  ];

  return {
    ...tip,
    conclusion: conclusions[Math.floor(Math.random() * conclusions.length)]
  };
}

/**
 * Coach persona: goal-oriented, practical, motivating
 */
function applyCoachTone(tip: RuleTip): RuleTip {
  const conclusions = [
    'Thực hiện được 2 điều này là bạn đã tiến bộ rõ rệt!',
    'Mục tiêu rõ ràng, bạn có thể làm được!',
    'Tôi tin bạn sẽ duy trì tốt những thay đổi này!',
    'Hành động nhỏ hôm nay, kết quả lớn ngày mai!'
  ];

  return {
    ...tip,
    conclusion: conclusions[Math.floor(Math.random() * conclusions.length)]
  };
}

/**
 * Advisor persona: concise, professional, respectful
 */
function applyAdvisorTone(tip: RuleTip): RuleTip {
  const conclusions = [
    'Đề xuất của tôi như trên, anh/chị tham khảo.',
    'Thực hiện theo gợi ý sẽ giúp cải thiện hiệu quả.',
    'Nếu cần thêm thông tin, anh/chị cho tôi biết.',
    'Tôi sẽ tiếp tục theo dõi và hỗ trợ anh/chị.'
  ];

  return {
    ...tip,
    conclusion: conclusions[Math.floor(Math.random() * conclusions.length)]
  };
}

/**
 * Adjust verbosity based on guidance_level
 */
export function applyGuidanceLevel(
  tip: RuleTip,
  level: GuidanceLevel = 'minimal'
): RuleTip {
  if (level === 'minimal') {
    // Keep only top suggestion if low_ask_mode
    return {
      ...tip,
      suggestions: tip.suggestions.slice(0, 1)
    };
  }

  // 'detailed' keeps all suggestions
  return tip;
}

/**
 * Full persona transformation
 */
export function transformWithPersona(
  tip: RuleTip,
  prefs: PersonaPrefs = {}
): RuleTip {
  let transformed = tip;

  // Apply persona tone
  if (prefs.ai_persona) {
    transformed = applyPersona(transformed, prefs.ai_persona);
  }

  // Apply guidance level
  if (prefs.guidance_level || prefs.low_ask_mode) {
    const level = prefs.low_ask_mode ? 'minimal' : (prefs.guidance_level || 'minimal');
    transformed = applyGuidanceLevel(transformed, level);
  }

  return transformed;
}

/**
 * Get default persona preferences
 * Used when profile.prefs is null/undefined
 */
export function getDefaultPersonaPrefs(): PersonaPrefs {
  return {
    ai_persona: 'friend',
    guidance_level: 'minimal',
    low_ask_mode: false
  };
}

/**
 * Safely extract persona prefs from profile.prefs JSONB
 * Handles missing/malformed prefs with defaults
 */
export function extractPersonaPrefs(prefs: any): PersonaPrefs {
  if (!prefs || typeof prefs !== 'object') {
    return getDefaultPersonaPrefs();
  }

  const defaults = getDefaultPersonaPrefs();

  return {
    ai_persona: ['friend', 'coach', 'advisor'].includes(prefs.ai_persona)
      ? prefs.ai_persona
      : defaults.ai_persona,
    guidance_level: ['minimal', 'detailed'].includes(prefs.guidance_level)
      ? prefs.guidance_level
      : defaults.guidance_level,
    low_ask_mode: typeof prefs.low_ask_mode === 'boolean'
      ? prefs.low_ask_mode
      : defaults.low_ask_mode
  };
}
