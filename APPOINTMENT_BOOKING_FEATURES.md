# Appointment Booking Features - Implementation Guide

This document describes the complete implementation of the appointment booking system with all requested features.

## Features Implemented

### ✅ Feature 1: View Available Time Slots for Different Doctors

**Backend Implementation:**
- **Endpoint**: `GET /api/doctor-slots/:doctorId/:date`
- **Controller**: `backend/controllers/doctorSlotController.js`
- **Model**: `backend/models/DoctorSlot.js`
- Automatically calculates available slots based on existing appointments
- Default slots: 09:00 to 17:00 (30-minute intervals)

**Frontend Implementation:**
- **Component**: `frontend/src/pages/Doctors.jsx`
- **Component**: `frontend/src/pages/BookAppointment.jsx`
- Fetches doctors from MongoDB via `GET /api/users/doctors`
- Dynamically loads available slots when doctor and date are selected
- Real-time slot availability updates

**How It Works:**
1. Patient selects a doctor from the list (fetched from MongoDB)
2. Patient selects an appointment date
3. System fetches available slots for that doctor on that date
4. System filters out already booked slots
5. Patient sees only available time slots

### ✅ Feature 2: Select Preferred Doctors and Schedule Appointments

**Backend Implementation:**
- **Endpoint**: `POST /api/appointments`
- **Controller**: `backend/controllers/appointmentController.js`
- **Model**: `backend/models/Appointment.js`
- Automatically confirms appointments upon creation
- Links appointment to patient and doctor via MongoDB ObjectIds
- Validates doctor exists before creating appointment

**Frontend Implementation:**
- **Component**: `frontend/src/pages/BookAppointment.jsx`
- **Controller**: `frontend/src/controllers/AppointmentController.js`
- Form validation for all required fields
- Real-time slot availability checking
- Success/error messaging

**How It Works:**
1. Patient fills out appointment form:
   - Patient name, email, phone
   - Doctor selection
   - Date selection
   - Time slot selection
2. System validates all fields
3. System checks if slot is still available
4. Appointment is created in MongoDB
5. Appointment is automatically confirmed
6. Notification is created (see Feature 4)

### ✅ Feature 3: Confirm Appointments and Display in Patient Dashboard

**Backend Implementation:**
- **Endpoint**: `GET /api/appointments?email={patientEmail}`
- Appointments are automatically confirmed upon creation
- Status field: `confirmed`, `pending`, `completed`, `cancelled`
- Populates doctor and patient information

**Frontend Implementation:**
- **Component**: `frontend/src/pages/PatientDashboard.jsx`
- **Component**: `frontend/src/pages/PatientPortal.jsx`
- Displays all appointments for the logged-in patient
- Shows appointment details:
  - Doctor name and speciality
  - Date and time
  - Status
  - Patient information
- Filter by email functionality

**How It Works:**
1. Patient logs in
2. System fetches all appointments for patient's email
3. Appointments are displayed in the dashboard
4. Patient can filter appointments by email
5. All appointments show as "confirmed" status

### ✅ Feature 4: Appointment Reminders in Notification Panel

**Backend Implementation:**
- **Model**: `backend/models/Notification.js`
- **Controller**: `backend/controllers/notificationController.js`
- **Controller**: `backend/controllers/reminderController.js`
- **Endpoint**: `GET /api/notifications`
- **Endpoint**: `GET /api/reminders/upcoming`
- Automatically creates reminder notifications for appointments happening tomorrow
- Reminder notifications are stored in MongoDB

**Frontend Implementation:**
- **Component**: `frontend/src/components/NotificationBell.jsx`
- **Service**: `frontend/src/services/notificationService.js`
- **API**: `frontend/src/services/api.js` (notificationAPI)
- Notification bell shows unread count
- Dropdown displays all notifications
- Auto-refreshes every 30 seconds
- Mark as read functionality

**How It Works:**
1. When appointment is created, a confirmation notification is created
2. System checks for upcoming appointments (tomorrow)
3. Creates reminder notifications for appointments happening tomorrow
4. Notifications appear in the notification bell
5. Patient can view, mark as read, or delete notifications

## MongoDB Storage

### Patient Registration
- **Model**: `backend/models/User.js`
- **Endpoint**: `POST /api/auth/register`
- All patient data is stored in MongoDB:
  - Name, email, password (hashed)
  - Role: 'patient'
  - Phone, address (optional)
  - Emergency contact (optional)
- Password is automatically hashed using bcrypt

### Login Verification
- **Endpoint**: `POST /api/auth/login`
- Verifies credentials against MongoDB
- Returns JWT token for authentication
- Validates email, password, and role

### Data Storage
All data is stored in MongoDB Compass (offline version):
- **Users Collection**: Patient and doctor information
- **Appointments Collection**: All appointment records
- **Notifications Collection**: All notifications and reminders
- **DoctorSlots Collection**: Doctor availability slots

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new patient
- `POST /api/auth/login` - Login patient/doctor/admin

### Doctors
- `GET /api/users/doctors` - Get all doctors from MongoDB

### Appointments
- `GET /api/appointments` - Get all appointments (filtered by user role)
- `GET /api/appointments/:id` - Get single appointment
- `POST /api/appointments` - Create new appointment (auto-confirmed)
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Doctor Slots
- `GET /api/doctor-slots/:doctorId/:date` - Get available slots for doctor on date
- `PUT /api/doctor-slots/:doctorId/:date` - Update doctor slots

### Notifications
- `GET /api/notifications` - Get all notifications for user
- `GET /api/notifications/unread-count` - Get unread count
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Reminders
- `GET /api/reminders/upcoming` - Get upcoming appointments (triggers reminder check)
- `POST /api/reminders/check` - Manually trigger reminder check (admin only)

## Data Flow

### Booking an Appointment
1. Patient selects doctor → Fetches from MongoDB
2. Patient selects date → Fetches available slots from MongoDB
3. Patient selects time → Validates slot availability
4. Patient submits form → Creates appointment in MongoDB
5. System confirms appointment → Status set to 'confirmed'
6. System creates notification → Stored in MongoDB
7. Patient sees confirmation → In notification panel

### Viewing Appointments
1. Patient logs in → Authenticated via MongoDB
2. Patient opens dashboard → Fetches appointments from MongoDB
3. Appointments displayed → Filtered by patient email
4. Real-time updates → When new appointments are created

### Reminder System
1. Patient opens dashboard → Triggers reminder check
2. System checks upcoming appointments → Queries MongoDB
3. System creates reminders → For appointments tomorrow
4. Reminders appear → In notification panel
5. Patient sees reminders → Before appointment date

## Testing the Features

### Test Feature 1: View Available Slots
1. Login as patient
2. Go to "View Doctors & Slots" tab
3. Select a doctor
4. Select a date
5. View available time slots

### Test Feature 2: Book Appointment
1. Login as patient
2. Go to "Book Appointment" tab
3. Fill in all required fields
4. Select doctor, date, and time
5. Submit form
6. See success message

### Test Feature 3: View in Dashboard
1. Login as patient
2. Go to "My Dashboard" tab
3. See all confirmed appointments
4. Filter by email if needed

### Test Feature 4: Notifications
1. Book an appointment
2. Check notification bell (top right)
3. See confirmation notification
4. Wait for reminder (created for tomorrow's appointments)
5. Mark notifications as read

## Setup Instructions

1. **Start MongoDB**: Ensure MongoDB Compass is running
2. **Start Backend**: `cd backend && npm start`
3. **Start Frontend**: `cd frontend && npm run dev`
4. **Register a Patient**: Use signup page
5. **Register a Doctor**: Use signup page with role 'doctor'
6. **Book Appointment**: Login as patient and book appointment

## Notes

- All data persists in MongoDB
- Appointments are automatically confirmed
- Notifications are created automatically
- Reminders are checked when patient dashboard loads
- System works offline with MongoDB Compass
- All authentication uses MongoDB for verification
