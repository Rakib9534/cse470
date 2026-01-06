import Bill from '../models/Bill.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Get all bills
// @route   GET /api/bills
// @access  Private
export const getBills = async (req, res) => {
  try {
    let query = {};
    
    // Filter by patient email if patient role
    if (req.user.role === 'patient') {
      query.patientEmail = req.user.email;
    }
    
    if (req.query.email) {
      query.patientEmail = req.query.email;
    }

    const bills = await Bill.find(query)
      .populate('patientId', 'name email phone')
      .populate('createdBy', 'name email')
      .sort({ billDate: -1 });

    res.json({
      success: true,
      count: bills.length,
      data: bills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new bill
// @route   POST /api/bills
// @access  Private (Admin)
export const createBill = async (req, res) => {
  try {
    const patient = await User.findOne({ email: req.body.patientEmail });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Calculate totals
    const subtotal = req.body.items.reduce((sum, item) => sum + (item.total || 0), 0);
    const tax = req.body.tax || 0;
    const discount = req.body.discount || 0;
    const total = subtotal + tax - discount;

    const billData = {
      ...req.body,
      patientId: patient._id,
      patientName: patient.name,
      subtotal,
      total,
      createdBy: req.user._id
    };

    const bill = await Bill.create(billData);

    // Create notification for the patient when a new bill is created
    try {
      await Notification.create({
        userId: patient._id,
        title: '💰 New Bill Available',
        message: `A new bill for ${billData.total.toFixed(2)} has been issued. Please check your billing section for details.`,
        type: 'bill',
        billId: bill._id
      });
    } catch (notifyError) {
      // Log but don't fail the main request if notification creation fails
      console.error('Error creating bill notification:', notifyError);
    }

    res.status(201).json({
      success: true,
      data: bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update bill
// @route   PUT /api/bills/:id
// @access  Private (Admin)
export const updateBill = async (req, res) => {
  try {
    const bill = await Bill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    res.json({
      success: true,
      data: bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

