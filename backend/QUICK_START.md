# Quick Start Guide - Backend Server

## ✅ Problem Solved!

The port 5000 conflict has been resolved. The server is now running successfully!

## How to Start the Server

### Option 1: Use the Start Script (Recommended)
```powershell
cd backend
.\start-server.ps1
```

This script will:
- ✅ Check and create .env file if needed
- ✅ Kill any process using port 5000
- ✅ Start the server automatically

### Option 2: Manual Start
```powershell
cd backend
npm run dev
```

## If Port 5000 is Still in Use

### Quick Fix:
```powershell
cd backend
.\kill-port.ps1
npm run dev
```

### Manual Fix:
1. Find the process:
   ```powershell
   netstat -ano | findstr :5000
   ```
2. Kill the process (replace <PID> with the actual number):
   ```powershell
   taskkill /PID <PID> /F
   ```
3. Start server:
   ```powershell
   npm run dev
   ```

## Verify Server is Running

1. **Check terminal output:**
   ```
   ✅ MongoDB Connected: 127.0.0.1
   📊 Database: hospital-management
   🚀 Server running on http://localhost:5000
   ```

2. **Test health endpoint:**
   - Open browser: `http://localhost:5000/health`
   - Should see: `{"status":"OK",...}`

3. **Test registration:**
   - Try registering a new user in the frontend
   - Should work without errors!

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running: `net start MongoDB`
- Verify connection in MongoDB Compass: `mongodb://localhost:27017`
- Check .env file has correct `MONGODB_URI`

### Port Still in Use
- Use `.\kill-port.ps1` script
- Or change PORT in .env file to 5001

### Server Won't Start
- Check if .env file exists in backend folder
- Verify all dependencies installed: `npm install`
- Check MongoDB is running

## Current Status

✅ Server is running on port 5000
✅ MongoDB connection working
✅ Registration endpoint tested and working
✅ All API endpoints available

You can now use the frontend to register users!
