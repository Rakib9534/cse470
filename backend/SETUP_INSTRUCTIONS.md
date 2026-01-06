# Quick Setup Instructions

## Step 1: Create .env File

**Option A: Using PowerShell (Windows)**
```powershell
cd backend
.\create-env.ps1
```

**Option B: Manual Creation**
1. Go to the `backend` folder
2. Create a new file named `.env` (no extension)
3. Copy and paste this content:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hospital-management
JWT_SECRET=hospital-management-secret-key-2024-change-in-production-min-32-chars
NODE_ENV=development
```

## Step 2: Start MongoDB

**Windows:**
1. Open Command Prompt as Administrator
2. Run: `net start MongoDB`
3. If it says "service is already running", you're good!

**Verify MongoDB:**
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Create database: `hospital-management`

## Step 3: Start Backend Server

```bash
cd backend
npm install  # If you haven't already
npm run dev
```

**You should see:**
```
✅ MongoDB Connected: 127.0.0.1
📊 Database: hospital-management
🚀 Server running on http://localhost:5000
```

## Step 4: Test Registration

1. Start frontend: `cd frontend && npm run dev`
2. Go to signup page
3. Fill in the form and register

If you still see errors, check `REGISTRATION_TROUBLESHOOTING.md` for detailed help.
