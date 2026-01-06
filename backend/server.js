import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/database.js";
import seedAdmin from "./scripts/seedAdmin.js";

// Import routes
import authRoutes from "./routes/auth.js";
import appointmentRoutes from "./routes/appointments.js";
import labResultRoutes from "./routes/labResults.js";
import treatmentRoutes from "./routes/treatments.js";
import doctorSlotRoutes from "./routes/doctorSlots.js";
import equipmentRoutes from "./routes/equipment.js";
import billRoutes from "./routes/bills.js";
import userRoutes from "./routes/users.js";
import notificationRoutes from "./routes/notifications.js";
import reminderRoutes from "./routes/reminders.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Seed default admin user after a short delay to ensure DB connection
setTimeout(async () => {
  try {
    await seedAdmin();
  } catch (error) {
    console.error('⚠️  Warning: Could not seed admin user:', error.message);
  }
}, 2000);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Hospital Management System API is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/lab-results", labResultRoutes);
app.use("/api/treatments", treatmentRoutes);
app.use("/api/doctor-slots", doctorSlotRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reminders", reminderRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Server error",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

// Handle port already in use error
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error(`💡 Solution: Kill the process using port ${PORT} or change PORT in .env file`);
    console.error(`   Windows: netstat -ano | findstr :${PORT} (find PID), then taskkill /PID <PID> /F`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});
