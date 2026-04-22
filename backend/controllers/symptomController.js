import {
  chatWithAI,
  analyzeSymptoms as runAnalysis,
  generateFollowUp,
  getTranslation as translate,
} from '../services/symptomEngine.js';
import { filterPrompt, getEmergencyPromptAddition } from '../services/promptFilter.js';
import { getCachedResponse, setCachedResponse, getCachedAnalysis, setCachedAnalysis } from '../services/cacheService.js';
import diseases from '../data/diseases.json' with { type: 'json' };
import ChatSession from '../models/ChatSession.js';
import User from '../models/User.js';

const DISCLAIMER = '\n\n⚠️ *This is not a medical diagnosis. Please consult a healthcare professional for proper medical advice.*';

/**
 * POST /api/chat
 * Body: { messages: [{ role: 'user'|'assistant', content: string }], language: string }
 * Returns: { reply: string, isEmergency: boolean }
 */
export const chat = async (req, res) => {
  try {
    const { messages, language = 'en' } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Get the last user message for filtering
    const lastMessage = messages[messages.length - 1];
    const filterResult = filterPrompt(lastMessage?.content || '');

    if (!filterResult.allowed) {
      return res.json({ reply: filterResult.response, isEmergency: false, filtered: true });
    }

    // Check cache
    const cached = getCachedResponse(messages);
    if (cached && !filterResult.isEmergency) {
      return res.json({ reply: cached, isEmergency: false, cached: true });
    }

    // Call AI with emergency context if needed
    const options = {};
    if (filterResult.isEmergency) {
      options.emergencyAddition = getEmergencyPromptAddition();
    }

    let reply = await chatWithAI(messages, language, options);

    // Append disclaimer to substantive health responses
    if (reply.length > 100 && !reply.includes('not a medical diagnosis')) {
      reply += DISCLAIMER;
    }

    // Cache the response (skip emergency responses)
    if (!filterResult.isEmergency) {
      setCachedResponse(messages, reply);
    }

    res.json({ reply, isEmergency: filterResult.isEmergency || false });
  } catch (err) {
    console.error('chat error:', err.message);
    res.status(500).json({ error: 'Failed to get AI response. Please try again.' });
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

    // Check cache
    const cached = getCachedAnalysis(messages);
    if (cached) {
      return res.json({ predictions: cached, cached: true });
    }

    const predictions = await runAnalysis(messages);

    // Cache the analysis
    setCachedAnalysis(messages, predictions);

    // Save to DB and give Gamification points if logged in
    if (req.user && req.user.userId) {
      try {
        await ChatSession.create({
          user: req.user.userId,
          messages: messages.map(m => ({
            role: m.sender,
            content: m.text,
          })),
          predictions
        });

        // Award 10 points
        await User.findByIdAndUpdate(req.user.userId, {
          $inc: { 'gamification.points': 10 }
        });
      } catch (dbErr) {
        console.error('DB save error (non-fatal):', dbErr.message);
      }
    }

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
