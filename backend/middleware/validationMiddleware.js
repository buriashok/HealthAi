import Joi from 'joi';
import xss from 'xss';

// ─── XSS Sanitizer Middleware ────────────────────────────────────
// NOTE: In Express 5, req.query and req.params are read-only getters.
// We only sanitize req.body (which is the only mutable one).
export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
};

const sanitizeObject = (obj) => {
  if (typeof obj === 'string') return xss(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip sanitizing passwords to avoid breaking them
      if (key === 'password' || key === 'newPassword') {
        sanitized[key] = value;
      } else {
        sanitized[key] = sanitizeObject(value);
      }
    }
    return sanitized;
  }
  return obj;
};

// ─── MongoDB Injection Prevention ────────────────────────────────
// Manual sanitization instead of express-mongo-sanitize (which crashes on Express 5)
export const mongoSanitizeMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = stripDollarKeys(req.body);
  }
  next();
};

const stripDollarKeys = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(stripDollarKeys);
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) {
      console.warn(`[SECURITY] Stripped dangerous key "${key}" from request body`);
      continue; // Drop keys starting with $
    }
    cleaned[key] = stripDollarKeys(value);
  }
  return cleaned;
};

// ─── Validation Schemas ──────────────────────────────────────────

const schemas = {
  register: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .message('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  verifyOtp: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required(),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),

  resetPassword: Joi.object({
    email: Joi.string().email().required(),
    token: Joi.string().required(),
    newPassword: Joi.string().min(8).max(128).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .message('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  }),

  chat: Joi.object({
    messages: Joi.array().items(
      Joi.object({
        role: Joi.string().valid('user', 'assistant', 'system').required(),
        content: Joi.string().max(5000).required(),
      })
    ).max(50).required(),
    language: Joi.string().valid('en', 'es', 'hi', 'te').default('en'),
  }),

  analyzeSymptoms: Joi.object({
    messages: Joi.array().items(
      Joi.object({
        text: Joi.string().max(5000).required(),
        sender: Joi.string().required(),
      })
    ).max(50).required(),
  }),
};

// ─── Validation Middleware Factory ────────────────────────────────
export const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) return next();

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: messages,
      });
    }

    req.body = value; // Use validated/sanitized values
    next();
  };
};

export default { sanitizeInput, mongoSanitizeMiddleware, validate };
