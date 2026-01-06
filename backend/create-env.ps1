# PowerShell script to create .env file
# Run this script from the backend folder: .\create-env.ps1

$envContent = @"
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hospital-management
JWT_SECRET=hospital-management-secret-key-2024-change-in-production-min-32-chars
NODE_ENV=development
"@

if (Test-Path .env) {
    Write-Host ".env file already exists. Skipping creation." -ForegroundColor Yellow
} else {
    $envContent | Out-File -FilePath .env -Encoding utf8
    Write-Host ".env file created successfully!" -ForegroundColor Green
    Write-Host "Please verify the MongoDB connection string matches your setup." -ForegroundColor Cyan
}
