# Quick Start Script for Suno-Campus
# Run this script to start both backend and frontend servers

Write-Host "🚀 Starting Suno-Campus Application..." -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exist
$backendNodeModules = Test-Path "Backend\node_modules"
$frontendNodeModules = Test-Path "Frontend\sunocampus\node_modules"

if (-not $backendNodeModules) {
    Write-Host "⚠️  Backend dependencies not found. Installing..." -ForegroundColor Yellow
    cd Backend
    npm install
    cd ..
}

if (-not $frontendNodeModules) {
    Write-Host "⚠️  Frontend dependencies not found. Installing..." -ForegroundColor Yellow
    cd Frontend\sunocampus
    npm install
    cd ..\..
}

Write-Host "✅ Dependencies ready!" -ForegroundColor Green
Write-Host ""

# Start Backend Server in new window
Write-Host "🔧 Starting Backend Server (Port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\Backend'; npm start"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend Server in new window
Write-Host "🎨 Starting Frontend Server (Port 5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\Frontend\sunocampus'; npm run dev"

Write-Host ""
Write-Host "✨ Application Started!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access Points:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "📖 Quick Links:" -ForegroundColor Yellow
Write-Host "   Register: http://localhost:5173/register" -ForegroundColor White
Write-Host "   Login:    http://localhost:5173/login" -ForegroundColor White
Write-Host "   Home:     http://localhost:5173/" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window (servers will keep running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
