import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import { sanitizeInput, mongoSanitizeMiddleware } from './middleware/validationMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import symptomRoutes from './routes/symptomRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import { getCacheStats } from './services/cacheService.js';

const app = express();

// Connect to MongoDB
connectDB();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ─────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Allow inline styles for email templates
}));

// ─── Compression ─────────────────────────────────────────────────
app.use(compression());

// ─── Logging ─────────────────────────────────────────────────────
app.use(morgan('dev'));

// ─── Rate Limiting ───────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                  // 200 requests per window
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,                   // 20 auth requests per 15 min
  message: { error: 'Too many authentication attempts. Please try again later.' },
});

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute
  max: 15,                   // 15 AI requests per minute (matches Gemini free tier)
  message: { error: 'AI rate limit reached. Please wait a moment.' },
});

app.use(generalLimiter);

// ─── CORS ────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    callback(null, true); // Allow all for now; tighten in production
  },
  credentials: true,
}));

// ─── Body Parsing + Sanitization ─────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(mongoSanitizeMiddleware);
app.use(sanitizeInput);

// ─── Routes ──────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api', aiLimiter, symptomRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/history', historyRoutes);

// ─── Health Check ────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    groqConfigured: !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here',
    cache: getCacheStats(),
  });
});

// ─── Global Error Handler ────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Start Server ────────────────────────────────────────────────
app.listen(PORT, () => {
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasGroq = !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here';
  console.log(`\n  🏥 HealthAI Backend Server v2.0`);
  console.log(`  ➜ Running on http://localhost:${PORT}`);
  console.log(`  ➜ Health check: http://localhost:${PORT}/api/health`);
  console.log(`  ➜ Gemini API: ${hasGemini ? '✅ Configured' : '⚠️  Missing — add GEMINI_API_KEY to .env'}`);
  console.log(`  ➜ Groq API: ${hasGroq ? '✅ Fallback Ready' : '⚠️  No fallback'}`);
  console.log(`  ➜ Security: Helmet ✅ | Rate Limiting ✅ | Input Sanitization ✅\n`);
});
