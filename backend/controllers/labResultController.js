import LabResult from '../models/LabResult.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Get all lab results
// @route   GET /api/lab-results
// @access  Private
export const getLabResults = async (req, res) => {
  try {
    let query = {};
    
    // Filter by patient email if patient role
    if (req.user.role === 'patient') {
      query.patientEmail = req.user.email;
    }
    
    // Additional filters
    if (req.query.email) {
      query.patientEmail = req.query.email;
    }
    if (req.query.patientId) {
      query.patientId = req.query.patientId;
    }

    const labResults = await LabResult.find(query)
      .populate('patientId', 'name email phone')
      .populate('uploadedBy', 'name email')
      .sort({ testDate: -1 });

    res.json({
      success: true,
      count: labResults.length,
      data: labResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single lab result
// @route   GET /api/lab-results/:id
// @access  Private
export const getLabResult = async (req, res) => {
  try {
    const labResult = await LabResult.findById(req.params.id)
      .populate('patientId', 'name email phone address')
      .populate('uploadedBy', 'name email');

    if (!labResult) {
      return res.status(404).json({
        success: false,
        message: 'Lab result not found'
      });
    }

    res.json({
      success: true,
      data: labResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new lab result
// @route   POST /api/lab-results
// @access  Private (Admin, Technician)
export const createLabResult = async (req, res) => {
  try {
    // Get patient info
    const patient = await User.findOne({ email: req.body.patientEmail });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const labResultData = {
      ...req.body,
      patientId: patient._id,
      patientName: patient.name,
      uploadedBy: req.user._id,
      technicianName: req.user.name
    };

    const labResult = await LabResult.create(labResultData);

    // Create notification for the patient when a new lab result is uploaded
    try {
      await Notification.create({
        userId: patient._id,
        title: 'New Lab Report Available',
        message: `Your ${req.body.testType} report dated ${req.body.testDate} is now available.`,
        type: 'lab_result'
      });
    } catch (notifyError) {
      // Log but don't fail the main request if notification creation fails
      console.error('Error creating lab result notification:', notifyError);
    }

    res.status(201).json({
      success: true,
      data: labResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update lab result
// @route   PUT /api/lab-results/:id
// @access  Private (Admin, Technician)
export const updateLabResult = async (req, res) => {
  try {
    let labResult = await LabResult.findById(req.params.id);

    if (!labResult) {
      return res.status(404).json({
        success: false,
        message: 'Lab result not found'
      });
    }

    labResult = await LabResult.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: labResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete lab result
// @route   DELETE /api/lab-results/:id
// @access  Private (Admin)
export const deleteLabResult = async (req, res) => {
  try {
    const labResult = await LabResult.findById(req.params.id);

    if (!labResult) {
      return res.status(404).json({
        success: false,
        message: 'Lab result not found'
      });
    }

    await labResult.deleteOne();

    res.json({
      success: true,
      message: 'Lab result deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

