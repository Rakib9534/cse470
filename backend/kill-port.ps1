# PowerShell script to kill process using port 5000
# Usage: .\kill-port.ps1 [port_number]
# Default port: 5000

param(
    [int]$Port = 5000
)

Write-Host "Checking for processes using port $Port..." -ForegroundColor Cyan

$processes = netstat -ano | Select-String ":$Port" | Select-String "LISTENING"

if ($processes) {
    $pids = $processes | ForEach-Object {
        $_.ToString().Split()[-1]
    } | Select-Object -Unique
    
    foreach ($pid in $pids) {
        Write-Host "Found process with PID: $pid" -ForegroundColor Yellow
        try {
            $proc = Get-Process -Id $pid -ErrorAction Stop
            Write-Host "Killing process: $($proc.ProcessName) (PID: $pid)..." -ForegroundColor Yellow
            Stop-Process -Id $pid -Force
            Write-Host "✅ Process killed successfully!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Could not kill process $pid: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "✅ No processes found using port $Port" -ForegroundColor Green
}

Write-Host "`nYou can now start the server with: npm run dev" -ForegroundColor Cyan
