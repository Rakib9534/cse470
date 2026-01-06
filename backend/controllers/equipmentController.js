import Equipment from '../models/Equipment.js';

// @desc    Get all equipment
// @route   GET /api/equipment
// @access  Private
export const getEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find().sort({ name: 1 });

    res.json({
      success: true,
      count: equipment.length,
      data: equipment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single equipment
// @route   GET /api/equipment/:id
// @access  Private
export const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Book equipment
// @route   POST /api/equipment/:id/book
// @access  Private
export const bookEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    const booking = {
      patientId: req.user._id,
      patientName: req.user.name,
      date: req.body.date,
      time: req.body.time,
      purpose: req.body.purpose,
      status: 'booked'
    };

    equipment.bookings.push(booking);
    await equipment.save();

    res.status(201).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create equipment (Admin only)
// @route   POST /api/equipment
// @access  Private (Admin)
export const createEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.create(req.body);

    res.status(201).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update equipment
// @route   PUT /api/equipment/:id
// @access  Private (Admin)
export const updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

