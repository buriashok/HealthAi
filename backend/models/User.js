import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
  // Google OAuth (optional — users can also register via email)
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows null for email-registered users
  },

  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  // Email/password auth
  password: {
    type: String,
    minlength: 8,
    select: false, // Never returned by default in queries
  },

  avatar: {
    type: String,
  },

  // Role-based access control
  role: {
    type: String,
    enum: ['user', 'doctor', 'admin'],
    default: 'user',
  },

  // Email OTP verification
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
    select: false,
  },
  otpExpires: {
    type: Date,
    select: false,
  },

  // Password reset
  resetToken: {
    type: String,
    select: false,
  },
  resetTokenExpires: {
    type: Date,
    select: false,
  },

  // Refresh tokens (for JWT rotation)
  refreshTokens: [{
    token: { type: String },
    createdAt: { type: Date, default: Date.now },
  }],

  // Gamification
  gamification: {
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{ type: String }],
  },

  // User preferences
  settings: {
    language: { type: String, default: 'en' },
    theme: { type: String, default: 'dark' },
    fontSize: { type: String, enum: ['normal', 'large', 'xlarge'], default: 'normal' },
    notifications: { type: Boolean, default: true },
  },

  lastActive: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Clean up expired refresh tokens (keeps DB lean on free tier)
UserSchema.methods.cleanExpiredTokens = function () {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  this.refreshTokens = this.refreshTokens.filter(rt => rt.createdAt > sevenDaysAgo);
};

// Index for cleanup queries
UserSchema.index({ 'refreshTokens.createdAt': 1 }, { expireAfterSeconds: 604800 });

export default mongoose.model('User', UserSchema);
