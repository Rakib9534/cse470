import mongoose from 'mongoose';

const doctorSlotSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  availableSlots: [{
    type: String
  }],
  bookedSlots: [{
    type: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
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

doctorSlotSchema.index({ doctorId: 1, date: 1 }, { unique: true });

doctorSlotSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const DoctorSlot = mongoose.model('DoctorSlot', doctorSlotSchema);

export default DoctorSlot;

