import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  patientEmail: {
    type: String,
    required: true
  },
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online', 'insurance']
  },
  billDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  paidDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

billSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Bill = mongoose.model('Bill', billSchema);

export default Bill;

