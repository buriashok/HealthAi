// AI Engine — Gemini API (primary) with Groq fallback
// Supports dynamic health Q&A, symptom analysis, and multilingual responses

import { GoogleGenAI } from '@google/genai';

// Initialize Gemini
const geminiKey = process.env.GEMINI_API_KEY;
let ai = null;
if (geminiKey) {
  ai = new GoogleGenAI({ apiKey: geminiKey });
}

// Groq fallback
let groq = null;
async function getGroq() {
  if (groq) return groq;
  try {
    const GroqModule = await import('groq-sdk');
    const Groq = GroqModule.default;
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here') {
      groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
  } catch { /* Groq not available */ }
  return groq;
}

const GEMINI_MODEL = 'gemini-2.5-flash';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// ─── Translations ────────────────────────────────────────────────

const translations = {
  en: {
    greeting: "Hello! I'm HealthAI, your intelligent health assistant powered by Google Gemini. Ask me anything about health, symptoms, wellness, or medical topics. How can I help you today?",
    ask_symptom: "Please describe your main symptom in a few words.",
    analyzing: "Analyzing your symptoms with AI...",
    results: "Based on AI analysis, here are the predicted conditions:",
    disclaimer: "⚠️ Disclaimer: This is NOT a medical diagnosis. Please consult a healthcare professional for proper medical advice.",
    follow_up_default: "Can you tell me more about your symptoms? For example, when did they start and how severe are they?",
  },
  hi: {
    greeting: "नमस्ते! मैं HealthAI हूँ, आपका बुद्धिमान स्वास्थ्य सहायक। स्वास्थ्य, लक्षण, कल्याण, या चिकित्सा विषयों के बारे में कुछ भी पूछें। मैं आपकी कैसे मदद कर सकता हूँ?",
    ask_symptom: "कृपया अपने मुख्य लक्षण का वर्णन करें।",
    analyzing: "AI से आपके लक्षणों का विश्लेषण हो रहा है...",
    results: "AI विश्लेषण के आधार पर, यहाँ संभावित स्थितियाँ हैं:",
    disclaimer: "⚠️ अस्वीकरण: यह चिकित्सा निदान नहीं है। कृपया उचित चिकित्सा सलाह के लिए किसी स्वास्थ्य पेशेवर से परामर्श करें।",
    follow_up_default: "क्या आप अपने लक्षणों के बारे में और बता सकते हैं?",
  },
  te: {
    greeting: "నమస్కారం! నేను HealthAI, మీ తెలివైన ఆరోగ్య సహాయకుడిని. ఆరోగ్యం, లక్షణాలు, వెల్నెస్ లేదా వైద్య అంశాల గురించి ఏదైనా అడగండి. నేను మీకు ఎలా సహాయం చేయగలను?",
    ask_symptom: "దయచేసి మీ ప్రధాన లక్షణాన్ని వివరించండి.",
    analyzing: "AI తో మీ లక్షణాలను విశ్లేషిస్తోంది...",
    results: "AI విశ్లేషణ ఆధారంగా, ఇక్కడ అంచనా వేయబడిన పరిస్థితులు ఉన్నాయి:",
    disclaimer: "⚠️ నిరాకరణ: ఇది వైద్య నిర్ధారణ కాదు. సరైన వైద్య సలహా కోసం ఆరోగ్య నిపుణుడిని సంప్రదించండి.",
    follow_up_default: "మీ లక్షణాల గురించి మరింత చెప్పగలరా?",
  },
  es: {
    greeting: "¡Hola! Soy HealthAI, tu asistente de salud inteligente. Pregúntame cualquier cosa sobre salud, síntomas, bienestar o temas médicos. ¿Cómo puedo ayudarte hoy?",
    ask_symptom: "Por favor, describe tu síntoma principal en pocas palabras.",
    analyzing: "Analizando tus síntomas con IA...",
    results: "Basado en el análisis de IA, aquí están las condiciones predichas:",
    disclaimer: "⚠️ Aviso: Esto NO es un diagnóstico médico. Por favor consulta a un profesional de la salud.",
    follow_up_default: "¿Puedes contarme más sobre tus síntomas?",
  }
};

export const getTranslation = (lang, key) => {
  return (translations[lang] && translations[lang][key]) || translations['en'][key] || key;
};

// ─── System Prompt ───────────────────────────────────────────────

const SYSTEM_PROMPT = `You are HealthAI, an advanced, professional, and empathetic AI health assistant. You are designed to help users with ANY health-related question.

YOUR CAPABILITIES:
1. Answer ANY health, medical, wellness, fitness, nutrition, or mental health question
2. Analyze symptoms and suggest possible conditions
3. Provide general health advice and preventive care tips
4. Explain medical terms, procedures, and test results in simple language
5. Offer first-aid guidance
6. Discuss medications (general info only, never prescribe)
7. Mental health support and stress management advice

IMPORTANT RULES:
- Be warm, professional, and reassuring
- Answer DYNAMICALLY — you can answer ANY health-related question, not just symptoms
- When discussing symptoms, ask focused follow-up questions (ONE at a time)
- After 2-3 exchanges about symptoms, provide your assessment with possible conditions
- NEVER diagnose definitively — use "could indicate", "possibly", "may suggest"
- NEVER prescribe specific medication dosages
- NEVER provide advice that could delay emergency medical treatment
- Keep responses concise (3-5 sentences for simple questions, more for complex ones)
- If a question is NOT health-related, politely redirect: "I'm a health assistant. I'd be happy to help with health-related questions! Is there anything about your health I can help with?"
- ALWAYS end serious assessments with: "⚠️ This is not a medical diagnosis. Please consult a healthcare professional for proper medical advice."

ANTI-HALLUCINATION RULES:
- Only provide information based on established medical knowledge
- If you're unsure about something, say "I'm not certain about this specific topic. Please consult a medical professional."
- Never invent statistics, studies, or medical facts
- Clearly distinguish between common knowledge and specialized medical advice`;

const LANGUAGE_ADDONS = {
  en: '',
  hi: '\n\nThe user prefers Hindi. Respond in Hindi (Devanagari script). You may use common English medical terms where appropriate.',
  te: '\n\nThe user prefers Telugu. Respond in Telugu script. You may use common English medical terms where appropriate.',
  es: '\n\nThe user prefers Spanish. Respond in Spanish.',
};

// ─── Chat with AI (Gemini primary, Groq fallback) ────────────────

/**
 * Chat with the AI using full conversation history.
 * @param {Array} messages - Array of { role: 'user'|'assistant', content: string }
 * @param {string} language - 'en', 'hi', 'te', or 'es'
 * @param {object} options - { isEmergency: boolean }
 * @returns {Promise<string>} AI response text
 */
export const chatWithAI = async (messages, language = 'en', options = {}) => {
  const systemContent = SYSTEM_PROMPT
    + (LANGUAGE_ADDONS[language] || '')
    + (options.emergencyAddition || '');

  // Try Gemini first
  if (ai) {
    try {
      return await chatWithGemini(messages, systemContent);
    } catch (err) {
      console.error('Gemini error, falling back to Groq:', err.message);
    }
  }

  // Fallback to Groq
  const groqClient = await getGroq();
  if (groqClient) {
    try {
      return await chatWithGroq(groqClient, messages, systemContent);
    } catch (err) {
      console.error('Groq fallback error:', err.message);
    }
  }

  return 'I apologize, but I\'m unable to process your request right now. Please try again in a moment. If this is an emergency, please call 112 (India) or your local emergency number.';
};

async function chatWithGemini(messages, systemContent) {
  // Build conversation for Gemini
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    systemInstruction: systemContent,
    contents,
    config: {
      temperature: 0.6,
      maxOutputTokens: 8192,
    },
  });

  return response.text || 'I apologize, I was unable to process your request. Please try again.';
}

async function chatWithGroq(groqClient, messages, systemContent) {
  const systemMessage = { role: 'system', content: systemContent };

  const chatCompletion = await groqClient.chat.completions.create({
    messages: [systemMessage, ...messages],
    model: GROQ_MODEL,
    temperature: 0.6,
    max_tokens: 1024,
  });

  return chatCompletion.choices[0]?.message?.content || 'I apologize, I was unable to process your request.';
}

// ─── Analyze Symptoms ────────────────────────────────────────────

/**
 * Analyze symptoms and return structured predictions using AI.
 */
export const analyzeSymptoms = async (messagesHistory) => {
  const conversationText = messagesHistory.map(m => `${m.sender}: ${m.text}`).join('\n');

  const analysisPrompt = `You are a medical triage AI. Based on the following patient conversation, provide a JSON array of possible conditions with probability percentages.

RESPOND ONLY with a valid JSON array in this exact format, no other text:
[
  { "condition": "Condition Name", "probability": 75, "color": "#F59E0B" },
  { "condition": "Another Condition", "probability": 45, "color": "#EF4444" }
]

Use these colors based on severity:
- Low risk (routine): "#10B981" (green)
- Moderate risk: "#F59E0B" (amber)  
- High risk (urgent): "#EF4444" (red)

Provide 2-4 conditions, sorted by probability descending. Probabilities should be realistic.

Patient conversation:
${conversationText}

Provide the JSON analysis:`;

  // Try Gemini first
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: analysisPrompt,
        config: {
          temperature: 0.3,
          maxOutputTokens: 500,
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '[]';
      let parsed = JSON.parse(responseText);

      if (!Array.isArray(parsed)) {
        parsed = parsed.conditions || parsed.predictions || parsed.results || parsed.data || Object.values(parsed)[0];
      }

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => b.probability - a.probability);
      }
    } catch (err) {
      console.error('Gemini analyzeSymptoms error:', err.message);
    }
  }

  // Groq fallback
  const groqClient = await getGroq();
  if (groqClient) {
    try {
      const chatCompletion = await groqClient.chat.completions.create({
        messages: [
          { role: 'system', content: analysisPrompt.split('Patient conversation:')[0] },
          { role: 'user', content: `Patient conversation:\n${conversationText}\n\nProvide the JSON analysis:` }
        ],
        model: GROQ_MODEL,
        temperature: 0.3,
        max_tokens: 300,
        response_format: { type: 'json_object' },
      });

      const responseText = chatCompletion.choices[0]?.message?.content || '[]';
      let parsed = JSON.parse(responseText);
      if (!Array.isArray(parsed)) {
        parsed = parsed.conditions || parsed.predictions || parsed.results || parsed.data || Object.values(parsed)[0];
      }
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => b.probability - a.probability);
      }
    } catch (err) {
      console.error('Groq analyzeSymptoms fallback error:', err.message);
    }
  }

  // Final fallback
  return [
    { condition: 'General Assessment Needed', probability: 60, color: '#F59E0B' },
    { condition: 'Consult a Doctor', probability: 50, color: '#10B981' },
  ];
};

// ─── Generate Follow-Up ──────────────────────────────────────────

export const generateFollowUp = async (inputText, lang = 'en') => {
  try {
    const response = await chatWithAI([
      { role: 'user', content: inputText }
    ], lang);
    return response;
  } catch (err) {
    console.error('generateFollowUp error:', err.message);
    return getTranslation(lang, 'follow_up_default');
  }
};
