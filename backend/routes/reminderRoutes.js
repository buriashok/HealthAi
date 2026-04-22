import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Reminder from '../models/Reminder.js';

const router = Router();

// GET /api/reminders — List user's active reminders
router.get('/', protect, async (req, res) => {
  try {
    const reminders = await Reminder.find({
      user: req.user.userId,
      active: true,
    }).sort({ createdAt: -1 }).limit(50);

    res.json({ reminders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// POST /api/reminders — Create new reminder
router.post('/', protect, async (req, res) => {
  try {
    const { medicineName, dosage, frequency, times, notes, endDate } = req.body;

    const reminder = await Reminder.create({
      user: req.user.userId,
      medicineName,
      dosage,
      frequency: frequency || 'daily',
      times: times || ['08:00'],
      notes,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    res.status(201).json({ reminder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// PUT /api/reminders/:id/complete — Mark as taken for today
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { $push: { completedDates: new Date() } },
      { new: true }
    );
    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });
    res.json({ reminder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete reminder' });
  }
});

// PUT /api/reminders/:id — Update reminder
router.put('/:id', protect, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });
    res.json({ reminder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

// DELETE /api/reminders/:id — Deactivate reminder
router.delete('/:id', protect, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { active: false },
      { new: true }
    );
    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });
    res.json({ message: 'Reminder deactivated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

export default router;
