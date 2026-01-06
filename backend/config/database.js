import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Support both MONGO_URI and MONGODB_URI environment variables
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error("❌ MongoDB connection error: MONGO_URI or MONGODB_URI not found in environment variables");
      console.error("💡 Please create a .env file in the backend folder with:");
      console.error("   MONGODB_URI=mongodb://localhost:27017/hospital-management");
      console.error("   JWT_SECRET=your-secret-key");
      console.error("   PORT=5000");
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoURI, {
      // Add connection options for better error handling
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.error("\n💡 Troubleshooting steps:");
    console.error("   1. Make sure MongoDB is installed and running");
    console.error("   2. Check if MongoDB service is started: net start MongoDB (Windows)");
    console.error("   3. Verify connection string in .env file");
    console.error("   4. Try connecting with MongoDB Compass: mongodb://localhost:27017");
    console.error("\n📝 Default connection string: mongodb://localhost:27017/hospital-management");
    process.exit(1);
  }
};

export default connectDB;
