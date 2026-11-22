# Run AirWatch CO locally (quick reference)

Open **two terminals** from the project root:

`d:\Business_Stats_AirQuality_Project`

---

## First time only (setup)

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt -r backend/requirements.txt

cd frontend
npm install
cd ..
```

---

## Every time — Terminal 1 (Backend / API)

```powershell
cd d:\Business_Stats_AirQuality_Project
.\.venv\Scripts\Activate.ps1
uvicorn backend.app.main:app --reload --port 8000
```

- API: http://localhost:8000  
- Docs: http://localhost:8000/docs  
- Health: http://localhost:8000/health  

---

## Every time — Terminal 2 (Frontend / Dashboard)

```powershell
cd d:\Business_Stats_AirQuality_Project\frontend
npm run dev
```

- Dashboard: http://localhost:5173  
- Statistics tab: http://localhost:5173/statistics  

---

## One-click (Windows)

From project root:

```powershell
.\start_project.ps1
```

or double-click / run:

```cmd
start_project.bat
```

---

## Optional checks

```powershell
# API tests (backend must be importable; uses TestClient)
.\.venv\Scripts\Activate.ps1
python test_backend_api.py

# Frontend production build
cd frontend
npm run build
```

---

## Cloud URLs (if deployed)

- API (Render): `https://business-stats-airquality-project.onrender.com`  
- UI (Vercel): `https://business-stats-air-quality-project.vercel.app`  
