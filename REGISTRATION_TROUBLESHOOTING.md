# Registration Troubleshooting Guide

If you're seeing "Registration failed" error, follow these steps:

## Step 1: Check Backend Server

1. **Open a terminal in the `backend` folder**
2. **Run the server:**
   ```bash
   npm run dev
   ```

3. **You should see:**
   ```
   ✅ MongoDB Connected: 127.0.0.1
   📊 Database: hospital-management
   🚀 Server running on http://localhost:5000
   ```

4. **If you see MongoDB connection error:**
   - Go to Step 2

5. **If server starts successfully:**
   - Test the health endpoint: Open `http://localhost:5000/health` in browser
   - You should see: `{"status":"OK",...}`
   - If this works, go to Step 3

## Step 2: Fix MongoDB Connection

### Check if MongoDB is Running

**Windows:**
1. Open Command Prompt as Administrator
2. Run: `net start MongoDB`
3. If it says "service is already running", MongoDB is running
4. If it says "service started successfully", MongoDB is now running

**Mac/Linux:**
```bash
brew services start mongodb-community
# or
sudo systemctl start mongod
```

### Verify MongoDB Connection

1. **Open MongoDB Compass**
2. **Connect to:** `mongodb://localhost:27017`
3. **If connection succeeds:**
   - Click "Create Database"
   - Database name: `hospital-management`
   - Collection name: `users` (optional)
   - Click "Create Database"

### Create/Update .env File

1. **Go to `backend` folder**
2. **Create a file named `.env`** (if it doesn't exist)
3. **Add this content:**
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/hospital-management
   JWT_SECRET=hospital-management-secret-key-2024-change-in-production-min-32-chars
   NODE_ENV=development
   ```

4. **Save the file**
5. **Restart the backend server**

## Step 3: Check Frontend Connection

1. **Open browser console** (F12)
2. **Try to register**
3. **Check for errors in console:**
   - If you see "Failed to fetch" or "NetworkError":
     - Backend server is not running
     - Go back to Step 1
   - If you see CORS error:
     - Backend CORS is not configured properly
     - Check backend/server.js has `app.use(cors())`

## Step 4: Test Registration API Directly

1. **Open browser or Postman**
2. **Make a POST request to:** `http://localhost:5000/api/auth/register`
3. **Headers:**
   ```
   Content-Type: application/json
   ```
4. **Body (JSON):**
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "test123",
     "role": "patient"
   }
   ```
5. **If this works:**
   - The backend is working correctly
   - The issue is in the frontend
   - Check browser console for frontend errors

## Step 5: Common Issues and Solutions

### Issue: "User already exists with this email"
**Solution:** Use a different email address

### Issue: "Database connection error"
**Solution:**
1. Make sure MongoDB is running (Step 2)
2. Check .env file has correct MONGODB_URI
3. Restart backend server

### Issue: "Cannot connect to server"
**Solution:**
1. Make sure backend server is running (Step 1)
2. Check if port 5000 is available
3. Verify frontend API URL is `http://localhost:5000/api`

### Issue: "NetworkError" or "Failed to fetch"
**Solution:**
1. Backend server is not running
2. Check firewall settings
3. Verify backend is on port 5000

## Quick Checklist

- [ ] MongoDB is installed and running
- [ ] MongoDB Compass can connect to `mongodb://localhost:27017`
- [ ] Database `hospital-management` exists in MongoDB
- [ ] `.env` file exists in `backend` folder
- [ ] `.env` file has `MONGODB_URI=mongodb://localhost:27017/hospital-management`
- [ ] Backend server is running (`npm run dev` in backend folder)
- [ ] Backend shows "✅ MongoDB Connected"
- [ ] `http://localhost:5000/health` returns `{"status":"OK"}`
- [ ] Frontend can reach backend (check browser console)

## Still Having Issues?

1. **Check backend terminal for errors**
2. **Check browser console for errors**
3. **Verify all environment variables are set correctly**
4. **Try restarting both backend and frontend servers**
5. **Clear browser cache and localStorage**
