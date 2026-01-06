import express from 'express';
import { checkAppointmentReminders, getUpcomingAppointments } from '../controllers/reminderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// This endpoint can be called by a cron job or scheduled task
router.route('/check')
  .post(protect, async (req, res) => {
    // Only allow admins to trigger reminder check manually
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const result = await checkAppointmentReminders();
    res.json(result);
  });

// Get upcoming appointments for current user
router.route('/upcoming')
  .get(protect, async (req, res) => {
    try {
      const appointments = await getUpcomingAppointments(req.user._id);
      res.json({
        success: true,
        count: appointments.length,
        data: appointments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

export default router;
