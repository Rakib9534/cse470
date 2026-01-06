# PowerShell script to start the backend server
# This script will:
# 1. Check if port 5000 is in use
# 2. Kill any process using it
# 3. Create .env file if it doesn't exist
# 4. Start the server

Write-Host "🚀 Starting Hospital Management Backend Server..." -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    $envContent = @"
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hospital-management
JWT_SECRET=hospital-management-secret-key-2024-change-in-production-min-32-chars
NODE_ENV=development
"@
    $envContent | Out-File -FilePath .env -Encoding utf8
    Write-Host "✅ .env file created" -ForegroundColor Green
} else {
    Write-Host "✅ .env file exists" -ForegroundColor Green
}

# Check for processes using port 5000
Write-Host "`n🔍 Checking port 5000..." -ForegroundColor Cyan
$processes = netstat -ano | Select-String ":5000" | Select-String "LISTENING"

if ($processes) {
    Write-Host "⚠️  Port 5000 is in use. Attempting to free it..." -ForegroundColor Yellow
    $pids = $processes | ForEach-Object {
        $_.ToString().Split()[-1]
    } | Select-Object -Unique
    
    foreach ($pid in $pids) {
        try {
            $proc = Get-Process -Id $pid -ErrorAction Stop
            Write-Host "   Killing process: $($proc.ProcessName) (PID: $pid)..." -ForegroundColor Yellow
            Stop-Process -Id $pid -Force
            Start-Sleep -Seconds 1
        } catch {
            Write-Host "   ⚠️  Could not kill process $pid" -ForegroundColor Yellow
        }
    }
    Write-Host "✅ Port 5000 is now free" -ForegroundColor Green
} else {
    Write-Host "✅ Port 5000 is available" -ForegroundColor Green
}

Write-Host "`n📦 Starting server..." -ForegroundColor Cyan
Write-Host ""

# Start the server
npm run dev
