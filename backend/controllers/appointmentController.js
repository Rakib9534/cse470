import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import DoctorSlot from '../models/DoctorSlot.js';

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req, res) => {
  try {
    let query = {};
    
    // Filter by patient email if patient role
    if (req.user.role === 'patient') {
      query.patientEmail = req.user.email;
    }
    
    // Filter by doctor if doctor role
    if (req.user.role === 'doctor') {
      query.doctorId = req.user._id;
    }

    // Additional filters from query params
    if (req.query.email) {
      query.patientEmail = req.query.email;
    }
    if (req.query.doctorId) {
      query.doctorId = req.query.doctorId;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email speciality')
      .sort({ date: -1, time: -1 });

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
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email phone address')
      .populate('doctorId', 'name email speciality');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;

    // Get doctor info
    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if slot is available
    const doctorSlot = await DoctorSlot.findOne({ doctorId, date });
    if (doctorSlot) {
      // Check if slot is in available slots and not booked
      const isAvailable = doctorSlot.availableSlots.includes(time);
      const isBooked = doctorSlot.bookedSlots.includes(time);
      
      if (!isAvailable || isBooked) {
        return res.status(400).json({
          success: false,
          message: `Time slot ${time} is not available for booking. Please select another time.`
        });
      }
    } else {
      // If no slot record exists, check if there's already an appointment at this time
      const existingAppointment = await Appointment.findOne({
        doctorId,
        date,
        time,
        status: { $in: ['confirmed', 'pending'] }
      });
      
      if (existingAppointment) {
        return res.status(400).json({
          success: false,
          message: `Time slot ${time} is already booked. Please select another time.`
        });
      }
    }

    // Find or use patient info
    let patientId = req.user._id;
    let patientName = req.body.patientName || req.user.name;
    let patientEmail = req.body.email || req.user.email;

    // If patient email is provided and different from logged-in user, try to find patient
    if (req.body.email && req.body.email !== req.user.email) {
      const patient = await User.findOne({ email: req.body.email, role: 'patient' });
      if (patient) {
        patientId = patient._id;
        patientName = req.body.patientName || patient.name;
        patientEmail = req.body.email;
      }
    }

    const appointmentData = {
      ...req.body,
      patientId: patientId,
      patientName: patientName,
      patientEmail: patientEmail,
      doctorName: doctor.name,
      speciality: doctor.speciality || req.body.speciality,
      status: 'confirmed' // Automatically confirm appointments
    };

    const appointment = await Appointment.create(appointmentData);

    // Update DoctorSlot to mark slot as booked
    if (doctorSlot) {
      // Remove from available slots and add to booked slots
      doctorSlot.availableSlots = doctorSlot.availableSlots.filter(slot => slot !== time);
      if (!doctorSlot.bookedSlots.includes(time)) {
        doctorSlot.bookedSlots.push(time);
      }
      await doctorSlot.save();
    } else {
      // Create new DoctorSlot record with booked slot
      await DoctorSlot.create({
        doctorId,
        date,
        availableSlots: [],
        bookedSlots: [time]
      });
    }

    // Create notification for appointment confirmation
    // Try to find user by email if patientId doesn't match logged-in user
    let notificationUserId = req.user._id;
    if (patientEmail && patientEmail !== req.user.email) {
      const patientUser = await User.findOne({ email: patientEmail });
      if (patientUser) {
        notificationUserId = patientUser._id;
      }
    }

    await Notification.create({
      userId: notificationUserId,
      title: '✅ Appointment Confirmed',
      message: `Your appointment with ${doctor.name} (${doctor.speciality || req.body.speciality}) on ${req.body.date} at ${req.body.time} has been confirmed.`,
      type: 'appointment',
      appointmentId: appointment._id
    });

    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const oldStatus = appointment.status;
    const oldTime = appointment.time;
    const oldDate = appointment.date;

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // If appointment was cancelled or status changed from confirmed/pending, free up the slot
    if ((oldStatus === 'confirmed' || oldStatus === 'pending') && 
        (appointment.status === 'cancelled' || appointment.status === 'completed')) {
      const doctorSlot = await DoctorSlot.findOne({ 
        doctorId: appointment.doctorId, 
        date: oldDate 
      });
      
      if (doctorSlot) {
        // Remove from booked slots and add back to available slots
        doctorSlot.bookedSlots = doctorSlot.bookedSlots.filter(slot => slot !== oldTime);
        if (!doctorSlot.availableSlots.includes(oldTime)) {
          doctorSlot.availableSlots.push(oldTime);
          doctorSlot.availableSlots.sort();
        }
        await doctorSlot.save();
      }
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Free up the slot if appointment was confirmed or pending
    if (appointment.status === 'confirmed' || appointment.status === 'pending') {
      const doctorSlot = await DoctorSlot.findOne({ 
        doctorId: appointment.doctorId, 
        date: appointment.date 
      });
      
      if (doctorSlot) {
        // Remove from booked slots and add back to available slots
        doctorSlot.bookedSlots = doctorSlot.bookedSlots.filter(slot => slot !== appointment.time);
        if (!doctorSlot.availableSlots.includes(appointment.time)) {
          doctorSlot.availableSlots.push(appointment.time);
          doctorSlot.availableSlots.sort();
        }
        await doctorSlot.save();
      }
    }

    await appointment.deleteOne();

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

