import DoctorSlot from '../models/DoctorSlot.js';
import Appointment from '../models/Appointment.js';

// Default time slots
const DEFAULT_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00'
];

// @desc    Get available slots for a doctor on a date
// @route   GET /api/doctor-slots/:doctorId/:date
// @access  Private
export const getSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    // Get all appointments for this doctor and date
    const appointments = await Appointment.find({
      doctorId,
      date,
      status: { $in: ['confirmed', 'pending'] }
    });

    const bookedSlots = appointments.map(apt => apt.time);

    // Get doctor slot record
    let doctorSlot = await DoctorSlot.findOne({ doctorId, date });

    if (!doctorSlot) {
      // If no slot record exists, use default slots
      // Create new slot record with default slots (excluding booked ones)
      doctorSlot = await DoctorSlot.create({
        doctorId,
        date,
        availableSlots: DEFAULT_SLOTS.filter(slot => !bookedSlots.includes(slot)),
        bookedSlots
      });
    } else {
      // Preserve doctor's custom slots, but filter out booked slots
      // Use the doctor's custom availableSlots, not DEFAULT_SLOTS
      const customSlots = doctorSlot.availableSlots && doctorSlot.availableSlots.length > 0 
        ? doctorSlot.availableSlots 
        : DEFAULT_SLOTS;
      
      // Filter out booked slots from custom slots
      doctorSlot.availableSlots = customSlots.filter(slot => !bookedSlots.includes(slot));
      doctorSlot.bookedSlots = bookedSlots;
      await doctorSlot.save();
    }

    res.json({
      success: true,
      data: {
        doctorId,
        date,
        availableSlots: doctorSlot.availableSlots,
        bookedSlots: doctorSlot.bookedSlots
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update doctor slots
// @route   PUT /api/doctor-slots/:doctorId/:date
// @access  Private (Doctor, Admin)
export const updateSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    const { availableSlots } = req.body;

    if (!availableSlots || !Array.isArray(availableSlots)) {
      return res.status(400).json({
        success: false,
        message: 'availableSlots must be an array'
      });
    }

    // Get current appointments to ensure booked slots are preserved
    const appointments = await Appointment.find({
      doctorId,
      date,
      status: { $in: ['confirmed', 'pending'] }
    });
    const bookedSlots = appointments.map(apt => apt.time);

    let doctorSlot = await DoctorSlot.findOne({ doctorId, date });

    if (doctorSlot) {
      // Preserve booked slots - don't allow removing slots that are already booked
      // Filter out any booked slots from the new availableSlots
      const newAvailableSlots = availableSlots.filter(slot => !bookedSlots.includes(slot));
      
      doctorSlot.availableSlots = newAvailableSlots;
      doctorSlot.bookedSlots = bookedSlots; // Update booked slots from current appointments
      await doctorSlot.save();
    } else {
      // Create new slot record
      const newAvailableSlots = availableSlots.filter(slot => !bookedSlots.includes(slot));
      doctorSlot = await DoctorSlot.create({
        doctorId,
        date,
        availableSlots: newAvailableSlots,
        bookedSlots: bookedSlots
      });
    }

    res.json({
      success: true,
      data: doctorSlot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

