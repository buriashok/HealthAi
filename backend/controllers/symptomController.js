import {
  chatWithAI,
  analyzeSymptoms as runAnalysis,
  generateFollowUp,
  getTranslation as translate,
} from '../services/symptomEngine.js';
import diseases from '../data/diseases.json' with { type: 'json' };

/**
 * POST /api/chat
 * Body: { messages: [{ role: 'user'|'assistant', content: string }], language: string }
 * Returns: { reply: string }
 */
export const chat = async (req, res) => {
  try {
    const { messages, language = 'en' } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }
    const reply = await chatWithAI(messages, language);
    res.json({ reply });
  } catch (err) {
    console.error('chat error:', err.message);
    res.status(500).json({ error: 'Failed to get AI response. Check your GROQ_API_KEY.' });
  }
};

/**
 * POST /api/symptoms/analyze
 * Body: { messages: [{ text: string, sender: string }] }
 */
export const analyzeSymptoms = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }
    const predictions = await runAnalysis(messages);
    res.json({ predictions });
  } catch (err) {
    console.error('analyzeSymptoms error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/symptoms/follow-up
 * Body: { inputText: string, lang: string }
 */
export const getFollowUp = async (req, res) => {
  try {
    const { inputText, lang = 'en' } = req.body;
    if (!inputText) {
      return res.status(400).json({ error: 'inputText is required' });
    }
    const text = await generateFollowUp(inputText, lang);
    res.json({ text });
  } catch (err) {
    console.error('getFollowUp error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/symptoms/translation/:lang/:key
 */
export const getTranslation = (req, res) => {
  try {
    const { lang, key } = req.params;
    const text = translate(lang, key);
    res.json({ text });
  } catch (err) {
    console.error('getTranslation error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/diseases
 */
export const getDiseases = (_req, res) => {
  res.json({ diseases });
};
