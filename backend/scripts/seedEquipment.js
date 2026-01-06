import mongoose from 'mongoose';
import Equipment from '../models/Equipment.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hospital-system');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const equipmentData = [
  {
    name: 'MRI Scanner',
    equipmentType: 'Imaging',
    description: 'High-resolution MRI scanner for detailed imaging and diagnosis',
    status: 'available',
    location: 'Radiology Wing - Room 101',
    availableSlots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    bookings: []
  },
  {
    name: 'CT Scanner',
    equipmentType: 'Imaging',
    description: 'Advanced CT scanner for rapid diagnostic imaging',
    status: 'available',
    location: 'Radiology Wing - Room 102',
    availableSlots: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
    bookings: []
  },
  {
    name: 'Ultrasound Machine',
    equipmentType: 'Imaging',
    description: 'High-quality ultrasound machine for various diagnostic procedures',
    status: 'available',
    location: 'Radiology Wing - Room 103',
    availableSlots: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
    bookings: []
  },
  {
    name: 'X-Ray Machine',
    equipmentType: 'Imaging',
    description: 'Digital X-Ray machine for bone and chest imaging',
    status: 'available',
    location: 'Radiology Wing - Room 104',
    availableSlots: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    bookings: []
  },
  {
    name: 'ECG Machine',
    equipmentType: 'Cardiology',
    description: 'Electrocardiogram machine for heart monitoring',
    status: 'available',
    location: 'Cardiology Department - Room 201',
    availableSlots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
    bookings: []
  },
  {
    name: 'Ventilator',
    equipmentType: 'Critical Care',
    description: 'Advanced ventilator for respiratory support',
    status: 'available',
    location: 'ICU - Room 301',
    availableSlots: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
    bookings: []
  },
  {
    name: 'Defibrillator',
    equipmentType: 'Emergency',
    description: 'Automated external defibrillator for emergency cardiac care',
    status: 'available',
    location: 'Emergency Department',
    availableSlots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
    bookings: []
  },
  {
    name: 'Dialysis Machine',
    equipmentType: 'Nephrology',
    description: 'Hemodialysis machine for kidney treatment',
    status: 'available',
    location: 'Nephrology Department - Room 401',
    availableSlots: ['08:00', '10:00', '12:00', '14:00', '16:00'],
    bookings: []
  }
];

const seedEquipment = async () => {
  try {
    await connectDB();

    // Delete existing equipment (optional - remove if you want to keep existing data)
    await Equipment.deleteMany({});
    console.log('Cleared existing equipment data');

    // Insert equipment
    const equipment = await Equipment.insertMany(equipmentData);
    console.log(`✅ Seeded ${equipment.length} equipment items`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding equipment:', error);
    process.exit(1);
  }
};

// Run if executed directly
seedEquipment();

export default seedEquipment;

