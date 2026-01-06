# 🚀 Quick Start Guide

## What You Need to Do Right Now

### 1️⃣ Install Backend Dependencies (2 minutes)

```bash
cd backend
npm install
```

### 2️⃣ Create .env File (1 minute)

1. Go to the `backend` folder
2. Copy `backend/.env.example` and rename it to `.env`
   - Or create a new file named `.env`
   - Add this content:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hospital-management
JWT_SECRET=hospital-management-secret-key-2024-change-in-production
NODE_ENV=development
```

### 3️⃣ Set Up MongoDB (5-10 minutes)

**If MongoDB is NOT installed:**

1. Download MongoDB Community Server:
   - https://www.mongodb.com/try/download/community
   - Install with default settings

2. Download MongoDB Compass:
   - https://www.mongodb.com/try/download/compass
   - Install it

**Start MongoDB:**
- On Windows: MongoDB service should start automatically
- If not: Open Command Prompt as Admin → `net start MongoDB`

**Connect & Create Database:**
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Click "Create Database"
4. Name: `hospital-management`
5. Click "Create"

### 4️⃣ Start Backend Server (1 minute)

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Connected: 127.0.0.1
📊 Database: hospital-management
🚀 Server running on http://localhost:5000
```

### 5️⃣ Test It Works

Open browser: `http://localhost:5000/health`

You should see: `{"status":"OK",...}`

### 6️⃣ Start Frontend (in new terminal)

```bash
cd frontend
npm run dev
```

Open: `http://localhost:5173`

## ✅ That's It!

Your system is now running with:
- ✅ Backend API on port 5000
- ✅ MongoDB database connected
- ✅ Frontend on port 5173
- ✅ Everything connected and working!

## 📋 Checklist

- [ ] Installed backend dependencies (`npm install` in backend folder)
- [ ] Created `.env` file in backend folder
- [ ] MongoDB installed and running
- [ ] MongoDB Compass connected
- [ ] Database `hospital-management` created
- [ ] Backend server started (`npm run dev`)
- [ ] Health check works (`http://localhost:5000/health`)
- [ ] Frontend started (`npm run dev` in frontend folder)

## 🆘 Having Issues?

See `NEXT_STEPS.md` for detailed troubleshooting.

