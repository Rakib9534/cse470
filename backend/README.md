# Hospital Management System - Backend

MERN Stack backend for Hospital Management System with MongoDB.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. MongoDB Setup

1. **Install MongoDB Community Server** (if not already installed)
   - Download from: https://www.mongodb.com/try/download/community
   - Install MongoDB on your system

2. **Install MongoDB Compass** (Desktop GUI)
   - Download from: https://www.mongodb.com/try/download/compass
   - Install MongoDB Compass

3. **Start MongoDB Service**
   - On Windows: MongoDB service should start automatically
   - Or start manually: `net start MongoDB` (Run as Administrator)
   - On Mac/Linux: `brew services start mongodb-community` or `sudo systemctl start mongod`

4. **Connect MongoDB Compass**
   - Open MongoDB Compass
   - Use connection string: `mongodb://localhost:27017`
   - Click "Connect"

5. **Create Database**
   - In MongoDB Compass, click "Create Database"
   - Database name: `hospital-management`
   - Collection name: (leave empty or type `users`)
   - Click "Create Database"

### 3. Environment Variables

Create a `.env` file in the `backend` folder:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hospital-management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

**Important:** Change the `JWT_SECRET` to a secure random string in production.

### 4. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Appointments
- `GET /api/appointments` - Get all appointments (Protected)
- `GET /api/appointments/:id` - Get single appointment (Protected)
- `POST /api/appointments` - Create appointment (Protected)
- `PUT /api/appointments/:id` - Update appointment (Protected)
- `DELETE /api/appointments/:id` - Delete appointment (Protected)

### Lab Results
- `GET /api/lab-results` - Get all lab results (Protected)
- `GET /api/lab-results/:id` - Get single lab result (Protected)
- `POST /api/lab-results` - Create lab result (Admin/Technician)
- `PUT /api/lab-results/:id` - Update lab result (Admin/Technician)
- `DELETE /api/lab-results/:id` - Delete lab result (Admin)

### Treatments
- `GET /api/treatments` - Get all treatments (Protected)
- `GET /api/treatments/:id` - Get single treatment (Protected)
- `POST /api/treatments` - Create treatment (Doctor)
- `PUT /api/treatments/:id` - Update treatment (Doctor)
- `DELETE /api/treatments/:id` - Delete treatment (Doctor/Admin)

### Doctor Slots
- `GET /api/doctor-slots/:doctorId/:date` - Get available slots (Protected)
- `PUT /api/doctor-slots/:doctorId/:date` - Update slots (Doctor/Admin)

### Equipment
- `GET /api/equipment` - Get all equipment (Protected)
- `GET /api/equipment/:id` - Get single equipment (Protected)
- `POST /api/equipment` - Create equipment (Admin)
- `PUT /api/equipment/:id` - Update equipment (Admin)
- `POST /api/equipment/:id/book` - Book equipment (Protected)

### Bills
- `GET /api/bills` - Get all bills (Protected)
- `POST /api/bills` - Create bill (Admin)
- `PUT /api/bills/:id` - Update bill (Admin)

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get single user (Protected)
- `PUT /api/users/:id` - Update user (Protected)
- `DELETE /api/users/:id` - Delete user (Admin)

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Database Models

- **User** - Patients, Doctors, Admins, Technicians
- **Appointment** - Patient appointments with doctors
- **LabResult** - Laboratory test results
- **Treatment** - Treatment notes and prescriptions
- **DoctorSlot** - Available time slots for doctors
- **Equipment** - Hospital equipment and bookings
- **Bill** - Patient bills and invoices

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

