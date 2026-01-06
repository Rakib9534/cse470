import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';

/**
 * Check for upcoming appointments and create reminders
 * This should be called periodically (e.g., via cron job or scheduled task)
 */
export const checkAppointmentReminders = async () => {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    // Find appointments happening tomorrow (confirmed or pending)
    const upcomingAppointments = await Appointment.find({
      status: { $in: ['confirmed', 'pending'] },
      date: {
        $gte: tomorrow.toISOString().split('T')[0],
        $lt: dayAfter.toISOString().split('T')[0]
      }
    }).populate('patientId', 'name email');

    const remindersCreated = [];

    for (const appointment of upcomingAppointments) {
      // Check if reminder already exists for this appointment
      const existingReminder = await Notification.findOne({
        appointmentId: appointment._id,
        type: 'reminder',
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
        }
      });

      if (!existingReminder && appointment.patientId) {
        // Create reminder notification
        const reminder = await Notification.create({
          userId: appointment.patientId._id,
          title: '📅 Appointment Reminder',
          message: `Reminder: You have an appointment with ${appointment.doctorName} (${appointment.speciality}) tomorrow on ${appointment.date} at ${appointment.time}.`,
          type: 'reminder',
          appointmentId: appointment._id
        });

        remindersCreated.push(reminder);
      }
    }

    return {
      success: true,
      remindersCreated: remindersCreated.length,
      message: `Created ${remindersCreated.length} appointment reminders`
    };
  } catch (error) {
    console.error('Error checking appointment reminders:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get upcoming appointments for a user (next 7 days)
 */
export const getUpcomingAppointments = async (userId) => {
  try {
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const appointments = await Appointment.find({
      patientId: userId,
      status: { $in: ['confirmed', 'pending'] },
      date: {
        $gte: now.toISOString().split('T')[0],
        $lte: nextWeek.toISOString().split('T')[0]
      }
    })
    .populate('doctorId', 'name email speciality')
    .sort({ date: 1, time: 1 });

    return appointments;
  } catch (error) {
    console.error('Error getting upcoming appointments:', error);
    return [];
  }
};
