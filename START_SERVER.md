# How to Start the Server

## Quick Command

```bash
cd backend
npm run dev
```

## Detailed Instructions

### Step 1: Open Terminal
Open PowerShell or Command Prompt

### Step 2: Navigate to Backend Folder
```bash
cd C:\Users\Rakibul\Desktop\hospital-system\backend
```

### Step 3: Start Server
```bash
npm run dev
```

**Note:** Use `npm run dev` (not `node server.js`) because:
- It uses nodemon which auto-restarts on file changes
- Better for development

### Step 4: Check Output

You should see:
```
✅ MongoDB Connected: 127.0.0.1
📊 Database: hospital-management
🚀 Server running on http://localhost:5000
```

### Step 5: Test in Browser

Open: `http://localhost:5000/health`

## Common Issues

### Issue 1: MongoDB Connection Error
**Error:** `❌ MongoDB connection error`

**Fix:**
1. Start MongoDB service: `net start MongoDB` (as Admin)
2. Or install MongoDB if not installed
3. Create database in MongoDB Compass

### Issue 2: Port Already in Use
**Error:** `Port 5000 already in use`

**Fix:**
1. Change PORT in `.env` to 5001
2. Or stop the process using port 5000

### Issue 3: Module Not Found
**Error:** `Cannot find package 'express'`

**Fix:**
1. Run: `npm install` in backend folder
2. ✅ Already done!

## Success Checklist

- [x] Dependencies installed (`npm install` completed)
- [ ] MongoDB installed and running
- [ ] Database `hospital-management` created
- [ ] `.env` file exists
- [ ] Server started with `npm run dev`
- [ ] Health check works (`http://localhost:5000/health`)

