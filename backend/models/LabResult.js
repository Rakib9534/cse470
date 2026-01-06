import mongoose from 'mongoose';

const labResultSchema = new mongoose.Schema({
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
  testName: {
    type: String,
    required: true,
    trim: true
  },
  testType: {
    type: String,
    required: true,
    trim: true
  },
  results: {
    type: String,
    required: true
  },
  testDate: {
    type: Date,
    required: true
  },
  reportDate: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  technicianName: {
    type: String
  },
  fileUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'reviewed'],
    default: 'completed'
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

labResultSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const LabResult = mongoose.model('LabResult', labResultSchema);

export default LabResult;

