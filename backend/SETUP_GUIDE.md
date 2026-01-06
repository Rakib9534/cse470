# Backend Setup Guide

## Quick Start

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Create .env File

Create a file named `.env` in the `backend` folder with the following content:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hospital-management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
NODE_ENV=development
```

**Note:** Replace `your-super-secret-jwt-key-change-this-in-production-min-32-chars` with a secure random string.

### 3. Start MongoDB

1. Make sure MongoDB is installed and running on your system
2. MongoDB Compass should connect to `mongodb://localhost:27017`
3. Create a database named `hospital-management` in MongoDB Compass

### 4. Run the Backend Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### 5. Verify Connection

Visit `http://localhost:5000/health` in your browser. You should see:

```json
{
  "status": "OK",
  "message": "Hospital Management System API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Troubleshooting

### MongoDB Connection Error

If you see "MongoDB connection error":
1. Make sure MongoDB service is running
2. Check if MongoDB is running on port 27017
3. Verify the MONGODB_URI in your .env file
4. Try connecting to MongoDB using MongoDB Compass first

### Port Already in Use

If port 5000 is already in use:
1. Change PORT in .env file to a different port (e.g., 5001)
2. Update the frontend API URL accordingly

### Module Not Found Errors

If you see module errors:
1. Make sure you ran `npm install` in the backend folder
2. Delete `node_modules` and `package-lock.json`, then run `npm install` again

