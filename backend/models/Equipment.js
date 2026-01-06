import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  equipmentType: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'in-use', 'maintenance', 'unavailable'],
    default: 'available'
  },
  location: {
    type: String,
    trim: true
  },
  availableSlots: [{
    type: String
  }],
  bookings: [{
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    patientName: String,
    date: String,
    time: String,
    purpose: String,
    status: {
      type: String,
      enum: ['booked', 'completed', 'cancelled'],
      default: 'booked'
    },
    bookedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

equipmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Equipment = mongoose.model('Equipment', equipmentSchema);

export default Equipment;

