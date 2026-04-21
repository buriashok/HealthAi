import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import symptomRoutes from './routes/symptomRoutes.js';
import connectDB from './config/db.js';

const app = express();

// Connect to MongoDB
connectDB();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,  // Set this on Render to your Vercel URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow any Vercel preview URL or configured origins
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    callback(null, true); // Allow all for now; tighten in production
  },
  credentials: true,
}));
app.use(express.json());

// Routes
import authRoutes from './routes/authRoutes.js';
app.use('/api/auth', authRoutes);
app.use('/api', symptomRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    groqConfigured: !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here',
  });
});

// Start server
app.listen(PORT, () => {
  const hasKey = !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here';
  console.log(`\n  🏥 HealthAI Backend Server`);
  console.log(`  ➜ Running on http://localhost:${PORT}`);
  console.log(`  ➜ Health check: http://localhost:${PORT}/api/health`);
  console.log(`  ➜ Groq API: ${hasKey ? '✅ Configured' : '⚠️  Missing — add GROQ_API_KEY to .env'}\n`);
});
