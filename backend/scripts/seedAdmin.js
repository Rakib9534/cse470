import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to database if not already connected
    if (mongoose.connection.readyState === 0) {
      const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
      if (!mongoURI) {
        throw new Error('MONGO_URI or MONGODB_URI not found in environment variables');
      }
      await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
    }

    // Wait a bit to ensure connection is ready
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get admin credentials from environment or use secure defaults
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hospital.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123!';

    // Check for old admin account with email "admin" and migrate it
    const oldAdmin = await User.findOne({ email: 'admin', role: 'admin' });
    if (oldAdmin) {
      console.log('⚠️  Found old admin account with insecure email "admin"');
      console.log('   Migrating to secure email format...');
      oldAdmin.email = adminEmail;
      oldAdmin.password = adminPassword;
      oldAdmin.name = 'Administrator';
      oldAdmin.isActive = true;
      await oldAdmin.save();
      console.log('✅ Admin account migrated successfully!');
      console.log(`   New Email: ${adminEmail}`);
      console.log(`   New Password: ${adminPassword}`);
      return;
    }

    // Check if admin user already exists with new format
    const adminExists = await User.findOne({ email: adminEmail, role: 'admin' });
    
    if (adminExists) {
      console.log('✅ Admin user already exists.');
      console.log(`   Email: ${adminExists.email}`);
      
      // Only update if password is being reset via environment variable
      if (process.env.ADMIN_PASSWORD && process.env.RESET_ADMIN_PASSWORD === 'true') {
        console.log('   Resetting admin password...');
        adminExists.password = adminPassword;
        adminExists.role = 'admin';
        adminExists.name = 'Administrator';
        adminExists.isActive = true;
        await adminExists.save();
        console.log('✅ Admin password updated successfully!');
      } else {
        console.log('   Use RESET_ADMIN_PASSWORD=true to reset password');
      }
      return;
    }

    // Create default admin user with proper email format
    const adminUser = await User.create({
      name: 'Administrator',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      isActive: true
    });

    console.log('✅ Default admin user created successfully!');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('   Role: admin');
    console.log('');
    console.log('⚠️  SECURITY NOTE:');
    console.log('   - Change the admin password immediately after first login');
    console.log('   - Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables for custom credentials');
    console.log('   - Use RESET_ADMIN_PASSWORD=true to reset admin password on next run');
    
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    throw error;
  }
};

// Run seed if called directly (not imported)
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                      process.argv[1]?.includes('seedAdmin') ||
                      process.argv[1]?.endsWith('seedAdmin.js');

if (isMainModule) {
  seedAdmin().then(() => {
    mongoose.connection.close();
    process.exit(0);
  }).catch((error) => {
    console.error(error);
    mongoose.connection.close();
    process.exit(1);
  });
}

export default seedAdmin;
