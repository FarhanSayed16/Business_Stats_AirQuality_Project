Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  AirWatch CO - MCA I Statistics Internal Assessment" -ForegroundColor Green
Write-Host "  Launching FastAPI Backend + React Dashboard (Group 3)" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host "`n[1/2] Starting FastAPI Backend on port 8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot'; .\.venv\Scripts\Activate.ps1; uvicorn backend.app.main:app --reload --port 8000"

Write-Host "[2/2] Starting Vite React Frontend on port 5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\frontend'; npm run dev"

Write-Host "`nServers launched successfully!" -ForegroundColor Green
Write-Host "• FastAPI Swagger Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "• React Dashboard UI:   http://localhost:5173" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
