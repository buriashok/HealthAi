// Thin API client – delegates all logic to the backend Express server (Groq-powered)

// In dev, Vite proxies /api to localhost:5000. In production, use the full Render backend URL.
const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Send a chat message and get an AI response from Groq.
 * @param {Array} messages - OpenAI-format messages: [{ role: 'user'|'assistant', content: string }]
 * @param {string} language - 'en' or 'es'
 * @returns {Promise<string>} AI reply text
 */
export const sendChatMessage = async (messages, language = 'en') => {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, language }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'API error');
    return data.reply;
  } catch (err) {
    console.error('Chat API error:', err);
    throw err;
  }
};

export const getTranslation = async (lang, key) => {
  try {
    const res = await fetch(`${API_BASE}/symptoms/translation/${lang}/${key}`);
    const data = await res.json();
    return data.text;
  } catch {
    const fallback = {
      greeting: "Hello! I am your AI Health Assistant powered by Groq. Describe your symptoms and I'll help analyze them.",
      ask_symptom: "Please describe your main symptom in a few words.",
      analyzing: "Analyzing your symptoms with AI...",
      results: "Based on AI analysis, here are the predicted conditions:",
      disclaimer: "Disclaimer: This is not medical advice. Please consult a doctor for a professional diagnosis.",
      follow_up_default: "Can you tell me more about your symptoms?",
    };
    return fallback[key] || key;
  }
};

export const analyzeSymptoms = async (messagesHistory) => {
  try {
    const res = await fetch(`${API_BASE}/symptoms/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messagesHistory }),
    });
    const data = await res.json();
    return data.predictions;
  } catch {
    return [
      { condition: 'General Assessment Needed', probability: 60, color: '#F59E0B' },
      { condition: 'Consult a Doctor', probability: 50, color: '#10B981' },
    ];
  }
};
