# MVC Architecture Documentation

This document describes the Model-View-Controller (MVC) architecture implementation in the Hospital Management System.

## Architecture Overview

The application follows a strict MVC pattern with clear separation of concerns:

- **Models**: Data structures and business logic
- **Views**: Presentation layer (React components)
- **Controllers**: Handle user interactions and coordinate between models and views

## Frontend MVC Structure

### Models (`frontend/src/models/`)

Models represent data structures and contain business logic methods:

- `UserModel.js` - User data and authentication logic
- `AppointmentModel.js` - Appointment data and validation
- `LabResultModel.js` - Lab result data and business rules
- `TreatmentModel.js` - Treatment data and status management
- `DoctorSlotModel.js` - Doctor time slot availability
- `EquipmentModel.js` - Equipment status and maintenance
- `BillModel.js` - Billing calculations and status

**Model Responsibilities:**
- Data validation
- Business logic methods (e.g., `isUpcoming()`, `isPaid()`)
- Data transformation (e.g., `toJSON()`)
- Status checks and calculations

### Controllers (`frontend/src/controllers/`)

Controllers handle business logic and coordinate between models and views:

- `AuthController.js` - Authentication operations
- `AppointmentController.js` - Appointment management
- `LabResultController.js` - Lab result operations
- `TreatmentController.js` - Treatment management
- `DoctorSlotController.js` - Doctor slot availability
- `EquipmentController.js` - Equipment management
- `BillController.js` - Billing operations
- `ControllerProvider.jsx` - Provides controllers via React Context

**Controller Responsibilities:**
- Handle user input
- Coordinate between models and API services
- Manage controller state (e.g., cached data)
- Provide filtering and querying methods
- Error handling

### Views (`frontend/src/pages/` and `frontend/src/components/`)

Views are React components that handle presentation:

- **Pages**: Main page components (Login, PatientPortal, etc.)
- **Components**: Reusable UI components

**View Responsibilities:**
- Display data to users
- Capture user input
- Trigger controller methods
- Handle UI state (loading, errors, etc.)
- No direct API calls or business logic

### Services (`frontend/src/services/`)

Services handle API communication:

- `api.js` - API service layer for backend communication
- `notificationService.js` - Notification handling

**Service Responsibilities:**
- HTTP requests to backend
- Response handling
- Error management
- Token management

## Backend MVC Structure

### Models (`backend/models/`)

Mongoose models representing database schemas:

- `User.js` - User schema with authentication methods
- `Appointment.js` - Appointment schema
- `LabResult.js` - Lab result schema
- `Treatment.js` - Treatment schema
- `DoctorSlot.js` - Doctor slot schema
- `Equipment.js` - Equipment schema
- `Bill.js` - Bill schema

**Model Responsibilities:**
- Database schema definition
- Data validation
- Database operations (via Mongoose)
- Pre/post save hooks

### Controllers (`backend/controllers/`)

Express route handlers that process requests:

- `authController.js` - Authentication endpoints
- `appointmentController.js` - Appointment CRUD operations
- `labResultController.js` - Lab result operations
- `treatmentController.js` - Treatment management
- `doctorSlotController.js` - Slot management
- `equipmentController.js` - Equipment operations
- `billController.js` - Billing operations
- `userController.js` - User management

**Controller Responsibilities:**
- Handle HTTP requests
- Validate input data
- Call model methods
- Return JSON responses
- Error handling

### Routes (`backend/routes/`)

Express routers that define API endpoints:

- `auth.js` - Authentication routes
- `appointments.js` - Appointment routes
- `labResults.js` - Lab result routes
- `treatments.js` - Treatment routes
- `doctorSlots.js` - Slot routes
- `equipment.js` - Equipment routes
- `bills.js` - Bill routes
- `users.js` - User routes

**Route Responsibilities:**
- Define API endpoints
- Apply middleware (authentication, authorization)
- Connect routes to controllers
- No business logic

### Middleware (`backend/middleware/`)

Express middleware for cross-cutting concerns:

- `auth.js` - Authentication and authorization middleware

## Data Flow

### Frontend Flow

1. **User Interaction** → View component
2. **View** → Calls Controller method
3. **Controller** → Uses Model for validation/business logic
4. **Controller** → Calls Service (API) for data operations
5. **Service** → Makes HTTP request to backend
6. **Response** → Controller processes response
7. **Controller** → Creates/updates Model instances
8. **View** → Receives data and updates UI

### Backend Flow

1. **HTTP Request** → Route handler
2. **Route** → Applies middleware (auth, validation)
3. **Route** → Calls Controller method
4. **Controller** → Validates input
5. **Controller** → Calls Model methods
6. **Model** → Performs database operations
7. **Controller** → Returns JSON response

## Example: Creating an Appointment

### Frontend

```javascript
// View (BookAppointment.jsx)
const handleSubmit = async (appointmentData) => {
  const result = await appointmentController.createAppointment(appointmentData);
  if (result.success) {
    // Update UI
  }
};

// Controller (AppointmentController.js)
async createAppointment(appointmentData) {
  const appointment = new AppointmentModel(appointmentData);
  const errors = appointment.validate();
  if (errors.length > 0) return { success: false, error: errors };
  
  const response = await appointmentAPI.create(appointment.toJSON());
  return { success: true, appointment: new AppointmentModel(response.data) };
}

// Model (AppointmentModel.js)
validate() {
  const errors = [];
  if (!this.patientName) errors.push('Patient name required');
  return errors;
}
```

### Backend

```javascript
// Route (appointments.js)
router.post('/', protect, createAppointment);

// Controller (appointmentController.js)
export const createAppointment = async (req, res) => {
  const appointment = await Appointment.create(req.body);
  res.json({ success: true, data: appointment });
};

// Model (Appointment.js)
const appointmentSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  // ... other fields
});
```

## Benefits of MVC Architecture

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Maintainability**: Easy to locate and modify code
3. **Testability**: Each layer can be tested independently
4. **Scalability**: Easy to add new features without affecting other layers
5. **Reusability**: Models and controllers can be reused across views
6. **Team Collaboration**: Different developers can work on different layers

## Best Practices

1. **Views should not contain business logic** - Only presentation
2. **Controllers should not access the database directly** - Use models
3. **Models should not make HTTP requests** - Use services
4. **Services should not contain business logic** - Only API communication
5. **Keep controllers thin** - Delegate to models and services
6. **Use dependency injection** - Controllers provided via Context

## File Organization

```
frontend/src/
├── models/          # Data models
├── controllers/     # Business logic controllers
├── views/           # React components (pages)
├── components/      # Reusable UI components
├── services/        # API services
└── contexts/        # React contexts

backend/
├── models/          # Mongoose models
├── controllers/     # Route handlers
├── routes/          # Express routes
├── middleware/      # Express middleware
└── config/          # Configuration files
```

## Migration Notes

The application has been refactored from a mixed architecture to pure MVC:

- **Before**: Components directly called API services
- **After**: Components → Controllers → Models → Services → API

This ensures:
- Clear separation of concerns
- Better testability
- Easier maintenance
- Consistent architecture

