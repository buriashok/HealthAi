import { Router } from 'express';
import {
  analyzeSymptoms,
  getFollowUp,
  getTranslation,
  getDiseases,
  chat,
} from '../controllers/symptomController.js';

const router = Router();

// POST /api/chat — Free-form AI conversation (Groq LLM)
router.post('/chat', chat);

// POST /api/symptoms/analyze — Analyze symptoms and return structured predictions
router.post('/symptoms/analyze', analyzeSymptoms);

// POST /api/symptoms/follow-up — Generate a dynamic follow-up question
router.post('/symptoms/follow-up', getFollowUp);

// GET /api/symptoms/translation/:lang/:key — Get a translated string
router.get('/symptoms/translation/:lang/:key', getTranslation);

// GET /api/diseases — Return the triage rules database
router.get('/diseases', getDiseases);

export default router;
