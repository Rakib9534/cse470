import Treatment from '../models/Treatment.js';
import User from '../models/User.js';

// @desc    Get all treatments
// @route   GET /api/treatments
// @access  Private
export const getTreatments = async (req, res) => {
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
    
    // Additional filters
    if (req.query.email) {
      query.patientEmail = req.query.email;
    }
    if (req.query.doctorId) {
      query.doctorId = req.query.doctorId;
    }
    if (req.query.patientId) {
      query.patientId = req.query.patientId;
    }

    const treatments = await Treatment.find(query)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email speciality')
      .populate('appointmentId')
      .sort({ treatmentDate: -1 });

    res.json({
      success: true,
      count: treatments.length,
      data: treatments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single treatment
// @route   GET /api/treatments/:id
// @access  Private
export const getTreatment = async (req, res) => {
  try {
    const treatment = await Treatment.findById(req.params.id)
      .populate('patientId', 'name email phone address')
      .populate('doctorId', 'name email speciality')
      .populate('appointmentId');

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: 'Treatment not found'
      });
    }

    res.json({
      success: true,
      data: treatment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new treatment
// @route   POST /api/treatments
// @access  Private (Doctor)
export const createTreatment = async (req, res) => {
  try {
    // Get patient info
    const patient = await User.findOne({ email: req.body.patientEmail });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const treatmentData = {
      ...req.body,
      patientId: patient._id,
      patientName: patient.name,
      doctorId: req.user._id,
      doctorName: req.user.name
    };

    const treatment = await Treatment.create(treatmentData);

    res.status(201).json({
      success: true,
      data: treatment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update treatment
// @route   PUT /api/treatments/:id
// @access  Private (Doctor)
export const updateTreatment = async (req, res) => {
  try {
    let treatment = await Treatment.findById(req.params.id);

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: 'Treatment not found'
      });
    }

    treatment = await Treatment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: treatment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete treatment
// @route   DELETE /api/treatments/:id
// @access  Private (Doctor, Admin)
export const deleteTreatment = async (req, res) => {
  try {
    const treatment = await Treatment.findById(req.params.id);

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: 'Treatment not found'
      });
    }

    await treatment.deleteOne();

    res.json({
      success: true,
      message: 'Treatment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

