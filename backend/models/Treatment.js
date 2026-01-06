import mongoose from 'mongoose';

const treatmentSchema = new mongoose.Schema({
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
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  diagnosis: {
    type: String,
    required: true,
    trim: true
  },
  prescription: [{
    medicineName: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  notes: {
    type: String,
    trim: true
  },
  treatmentDate: {
    type: Date,
    default: Date.now
  },
  followUpDate: {
    type: Date
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

treatmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Treatment = mongoose.model('Treatment', treatmentSchema);

export default Treatment;

