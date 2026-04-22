/**
 * Prompt filtering service — catches harmful, off-topic, and emergency inputs
 * before they reach the AI model.
 */

// Emergency keywords that trigger immediate emergency response
const EMERGENCY_KEYWORDS = [
  'suicide', 'suicidal', 'kill myself', 'want to die', 'end my life',
  'heart attack', 'stroke', 'can\'t breathe', 'choking', 'seizure',
  'overdose', 'poisoned', 'severe bleeding', 'unconscious',
  'chest pain severe', 'anaphylaxis', 'allergic shock',
];

// Blocked/harmful content patterns
const BLOCKED_PATTERNS = [
  /how\s+to\s+(make|create|build)\s+(bomb|weapon|drug|poison)/i,
  /illegal\s+drug/i,
  /self[- ]?harm\s+method/i,
];

// Non-health topics that should be redirected
const OFF_TOPIC_PATTERNS = [
  /\b(bitcoin|crypto|stock|trading|forex|investment)\b/i,
  /\b(hack|exploit|malware|virus\s+code)\b/i,
  /\b(recipe|cooking|food\s+prep)\b/i,
  /write\s+(code|program|script|essay|story)/i,
  /\b(sports\s+score|movie|celebrity|gossip)\b/i,
];

/**
 * Analyze user input and return a filter result.
 * @param {string} text - User input text
 * @returns {{ allowed: boolean, type: string, response?: string }}
 */
export const filterPrompt = (text) => {
  if (!text || typeof text !== 'string') {
    return { allowed: false, type: 'empty', response: 'Please provide a valid message.' };
  }

  const lowerText = text.toLowerCase().trim();

  // Check for emergency
  for (const keyword of EMERGENCY_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      return {
        allowed: true,
        type: 'emergency',
        isEmergency: true,
        response: null, // Let AI handle but with emergency context
      };
    }
  }

  // Check for blocked content
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(lowerText)) {
      return {
        allowed: false,
        type: 'blocked',
        response: 'I\'m sorry, I can\'t help with that request. I\'m a health assistant designed to help with medical questions. If you\'re in crisis, please call emergency services (112) or a mental health helpline.',
      };
    }
  }

  // Check for off-topic (but still allow through with a gentle redirect)
  for (const pattern of OFF_TOPIC_PATTERNS) {
    if (pattern.test(lowerText)) {
      return {
        allowed: true,
        type: 'off_topic',
        response: null, // AI will handle with system prompt guidance
      };
    }
  }

  // Text too short
  if (lowerText.length < 2) {
    return { allowed: false, type: 'too_short', response: 'Could you provide more details about your health concern?' };
  }

  // Text too long (prevent abuse)
  if (text.length > 5000) {
    return { allowed: false, type: 'too_long', response: 'Your message is too long. Please try to be more concise (max 5000 characters).' };
  }

  return { allowed: true, type: 'normal' };
};

/**
 * Get emergency system prompt addition
 */
export const getEmergencyPromptAddition = () => {
  return `\n\n🚨 EMERGENCY DETECTED: The user may be in a medical emergency or mental health crisis.
CRITICAL RULES:
1. Immediately advise calling emergency services (112 in India, 911 in US, 999 in UK)
2. Provide clear, calm first-aid instructions if applicable
3. If mental health crisis: provide suicide helpline numbers (iCall: 9152987821, Vandrevala Foundation: 1860-2662-345)
4. Do NOT minimize or dismiss their situation
5. Keep response SHORT and ACTION-ORIENTED`;
};

export default { filterPrompt, getEmergencyPromptAddition };
