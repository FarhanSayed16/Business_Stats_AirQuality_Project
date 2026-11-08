@echo off
echo ========================================================
echo   AirWatch CO - MCA I Statistics Internal Assessment
echo   Launching FastAPI Backend + React Dashboard (Group 3)
echo ========================================================

echo [1/2] Starting FastAPI Backend on port 8000...
start cmd /k "call .venv\Scripts\activate.bat && uvicorn backend.app.main:app --reload --port 8000"

echo [2/2] Starting Vite React Frontend on port 5173...
start cmd /k "cd frontend && npm run dev"

echo.
echo Servers launched!
echo - API Docs: http://localhost:8000/docs
echo - React Dashboard: http://localhost:5173
echo ========================================================
pause
