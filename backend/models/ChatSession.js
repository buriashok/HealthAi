import mongoose from 'mongoose';

const ChatSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    default: 'Symptom Assessment',
  },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'] },
    content: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  predictions: [{
    condition: { type: String },
    probability: { type: Number },
    color: { type: String }
  }]
}, {
  timestamps: true,
});

export default mongoose.model('ChatSession', ChatSessionSchema);
