import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Appointment from '../models/Appointment.js';

const router = Router();

// GET /api/appointments — List user's appointments (paginated)
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      Appointment.find({ user: req.user.userId })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Appointment.countDocuments({ user: req.user.userId }),
    ]);

    res.json({
      appointments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// POST /api/appointments — Create new appointment
router.post('/', protect, async (req, res) => {
  try {
    const { doctorName, specialty, date, timeSlot, notes } = req.body;

    const appointment = await Appointment.create({
      user: req.user.userId,
      doctorName,
      specialty,
      date: new Date(date),
      timeSlot,
      notes,
    });

    res.status(201).json({ appointment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// PUT /api/appointments/:id — Update appointment
router.put('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ appointment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// DELETE /api/appointments/:id — Cancel appointment
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { status: 'cancelled' },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ message: 'Appointment cancelled', appointment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

export default router;
