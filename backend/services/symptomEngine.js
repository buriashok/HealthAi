// Groq-powered Symptom Engine — replaces hardcoded keyword matching with LLM intelligence
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = 'llama-3.3-70b-versatile';

// ---------- Translations (kept server-side for fast access) ----------

const translations = {
  en: {
    greeting: "Hello! I am your AI Health Assistant powered by Groq. Describe your symptoms and I'll help analyze them.",
    ask_symptom: "Please describe your main symptom in a few words.",
    analyzing: "Analyzing your symptoms with AI...",
    results: "Based on AI analysis, here are the predicted conditions:",
    disclaimer: "Disclaimer: This is not medical advice. Please consult a doctor for a professional diagnosis.",
    follow_up_default: "Can you tell me more about your symptoms? For example, when did they start and how severe are they?",
  },
  es: {
    greeting: "¡Hola! Soy tu asistente de salud con IA, impulsado por Groq. Describe tus síntomas y te ayudaré a analizarlos.",
    ask_symptom: "Por favor, describe tu síntoma principal en pocas palabras.",
    analyzing: "Analizando tus síntomas con IA...",
    results: "Basado en el análisis de IA, aquí están las condiciones predichas:",
    disclaimer: "Aviso: Esto no es consejo médico. Por favor consulta a un médico para un diagnóstico profesional.",
    follow_up_default: "¿Puedes contarme más sobre tus síntomas? Por ejemplo, ¿cuándo empezaron y qué tan severos son?",
  }
};

export const getTranslation = (lang, key) => {
  return (translations[lang] && translations[lang][key]) || translations['en'][key] || key;
};

// ---------- AI-Powered Chat (Groq LLM) ----------

const SYSTEM_PROMPT = `You are HealthAI, a professional and empathetic AI health assistant. Your role is to:

1. Listen to user-described symptoms carefully
2. Ask relevant follow-up questions to better understand their condition
3. When you have enough information, provide a preliminary assessment with possible conditions and their likelihood percentages
4. Always remind users to consult a real doctor

IMPORTANT RULES:
- Be warm, professional, and reassuring
- Ask ONE focused follow-up question at a time
- When the user has described enough symptoms (usually after 2-3 exchanges), provide your analysis
- Never diagnose definitively — use words like "could indicate", "possibly", "may suggest"
- Keep responses concise (2-4 sentences max)
- If the user speaks Spanish, respond in Spanish
- Always end serious assessments with a reminder to see a doctor`;

/**
 * Chat with the AI using full conversation history.
 * @param {Array} messages - Array of { role: 'user'|'assistant', content: string }
 * @param {string} language - 'en' or 'es'
 * @returns {Promise<string>} AI response text
 */
export const chatWithAI = async (messages, language = 'en') => {
  const systemMessage = {
    role: 'system',
    content: SYSTEM_PROMPT + (language === 'es' ? '\n\nThe user prefers Spanish. Respond in Spanish.' : ''),
  };

  const chatCompletion = await groq.chat.completions.create({
    messages: [systemMessage, ...messages],
    model: MODEL,
    temperature: 0.6,
    max_tokens: 512,
  });

  return chatCompletion.choices[0]?.message?.content || 'I apologize, I was unable to process your request. Please try again.';
};

/**
 * Analyze symptoms and return structured predictions using AI.
 * @param {Array} messagesHistory - Array of { text: string, sender: string }
 * @returns {Promise<Array>} Array of { condition, probability, color }
 */
export const analyzeSymptoms = async (messagesHistory) => {
  const conversationText = messagesHistory.map(m => `${m.sender}: ${m.text}`).join('\n');

  const analysisPrompt = {
    role: 'system',
    content: `You are a medical triage AI. Based on the following patient conversation, provide a JSON array of possible conditions with probability percentages.

RESPOND ONLY with a valid JSON array in this exact format, no other text:
[
  { "condition": "Condition Name", "probability": 75, "color": "#F59E0B" },
  { "condition": "Another Condition", "probability": 45, "color": "#EF4444" }
]

Use these colors based on severity:
- Low risk (routine): "#10B981" (green)
- Moderate risk: "#F59E0B" (amber)  
- High risk (urgent): "#EF4444" (red)

Provide 2-4 conditions, sorted by probability descending. Probabilities should be realistic (don't all use the same number).`
  };

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        analysisPrompt,
        { role: 'user', content: `Patient conversation:\n${conversationText}\n\nProvide the JSON analysis:` }
      ],
      model: MODEL,
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    const responseText = chatCompletion.choices[0]?.message?.content || '[]';
    
    // Parse the JSON response — handle both array and object-with-array formats
    let parsed = JSON.parse(responseText);
    
    // If the model wrapped it in an object, extract the array
    if (!Array.isArray(parsed)) {
      // Try common keys like "conditions", "predictions", "results"
      parsed = parsed.conditions || parsed.predictions || parsed.results || parsed.data || Object.values(parsed)[0];
    }
    
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort((a, b) => b.probability - a.probability);
    }
  } catch (err) {
    console.error('Groq analyzeSymptoms error:', err.message);
  }

  // Fallback if AI fails
  return [
    { condition: 'General Assessment Needed', probability: 60, color: '#F59E0B' },
    { condition: 'Consult a Doctor', probability: 50, color: '#10B981' },
  ];
};

/**
 * Generate a follow-up question using AI.
 */
export const generateFollowUp = async (inputText, lang = 'en') => {
  try {
    const response = await chatWithAI([
      { role: 'user', content: inputText }
    ], lang);
    return response;
  } catch (err) {
    console.error('Groq generateFollowUp error:', err.message);
    return getTranslation(lang, 'follow_up_default');
  }
};
