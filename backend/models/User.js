import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  avatar: {
    type: String,
  },
  gamification: {
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{ type: String }],
  },
  settings: {
    language: { type: String, default: 'en' },
    theme: { type: String, default: 'dark' },
    notifications: { type: Boolean, default: true },
  },
  lastActive: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

export default mongoose.model('User', UserSchema);
