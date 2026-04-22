import mongoose from 'mongoose';

const ReminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  medicineName: {
    type: String,
    required: true,
    trim: true,
  },
  dosage: {
    type: String,
    required: true,
    trim: true,
  },
  frequency: {
    type: String,
    enum: ['once', 'daily', 'twice_daily', 'weekly', 'custom'],
    default: 'daily',
  },
  times: [{
    type: String, // "08:00", "20:00"
  }],
  active: {
    type: Boolean,
    default: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  completedDates: [{
    type: Date,
  }],
  notes: {
    type: String,
    maxlength: 300,
  },
}, {
  timestamps: true,
});

ReminderSchema.index({ user: 1, active: 1 });

export default mongoose.model('Reminder', ReminderSchema);
