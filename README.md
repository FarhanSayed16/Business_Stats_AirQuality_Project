# AirWatch CO — Urban Atmospheric Intelligence

**MCA I Statistics Internal Assessment · Group 3 — Air Quality and Pollution**

Predict **next-hour Carbon Monoxide** (`CO_next`) from the UCI Air Quality dataset, with a Python academic core and a FastAPI + React demo dashboard.

| | |
|--|--|
| **Dashboard (local)** | http://localhost:5173 |
| **API (local)** | http://localhost:8000 · docs at `/docs` |
| **Teammate brief** | [`docs/TEAM_PROJECT_BRIEF.md`](docs/TEAM_PROJECT_BRIEF.md) |
| **One-pager** | [`docs/PROJECT_ONE_PAGER.md`](docs/PROJECT_ONE_PAGER.md) |
| **System / decisions** | [`docs/SYSTEM_AND_DECISIONS.md`](docs/SYSTEM_AND_DECISIONS.md) |

---

## 1. What this project does

- **Research question:** Using only data available up to hour *t* (weather, sensors, pollutants), can we predict next-hour true `CO(GT)` without temporal leakage?
- **Academic deliverables:** Notebooks → cleaned CSV → tuned model → report (MD / HTML / PDF).
- **Demo deliverables:** FastAPI API + React **AirWatch CO** UI (Explore, Insights, Predict, Evaluation, Team).

**Critical data rule:** Invalid values are coded as **`-200`**. They must be treated as missing — never as real concentrations.

---

## 2. Prerequisites

Install these before the first run:

| Tool | Version (recommended) | Check |
|------|------------------------|-------|
| Python | 3.11 or 3.12 | `python --version` |
| Node.js | 18+ (LTS fine) | `node --version` |
| npm | comes with Node | `npm --version` |
| Git | any recent | `git --version` |

Windows PowerShell is the primary path documented below. macOS/Linux commands are equivalent (`python3`, `source .venv/bin/activate`).

---

## 3. Clone the repository

```bash
git clone https://github.com/FarhanSayed16/Business_Stats_AirQuality_Project.git
cd Business_Stats_AirQuality_Project
```

---

## 4. First-time setup (do once)

### 4.1 Python environment + dependencies

**PowerShell (Windows):**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt -r backend/requirements.txt
```

**macOS / Linux:**

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt -r backend/requirements.txt
```

### 4.2 Frontend dependencies

```bash
cd frontend
npm install
cd ..
```

You are ready when both steps finish without errors.

---

## 5. How to run the full system

### Option A — One-click (Windows)

With the venv already created and `frontend/node_modules` installed:

```powershell
.\start_project.ps1
```

or double-click / run:

```cmd
start_project.bat
```

This opens two terminals: API on **8000**, UI on **5173**.

### Option B — Manual (two terminals)

**Terminal 1 — API**

```powershell
# from repo root
.\.venv\Scripts\Activate.ps1
uvicorn backend.app.main:app --reload --port 8000
```

**Terminal 2 — UI**

```powershell
cd frontend
npm run dev
```

### URLs to open

| Service | URL |
|---------|-----|
| React dashboard | http://localhost:5173 |
| API health | http://localhost:8000/health |
| Swagger docs | http://localhost:8000/docs |
| Report (via API) | http://localhost:8000/reports/AIRWATCH_CO_FINAL_STATISTICS_REPORT.html |

**Demo path for viva:** Home → Explore Data → Insights → Predict Lab → Evaluation → Research Team.

---

## 6. Verify everything works

With the API running:

```powershell
.\.venv\Scripts\Activate.ps1
python test_backend_api.py
```

Frontend production build check:

```powershell
cd frontend
npm run build
```

Expected: API tests pass; frontend build completes into `frontend/dist/`.

---

## 7. Champion model results (holdout)

Source of truth: [`artifacts/metrics.json`](artifacts/metrics.json) — use these numbers in slides/report (do not invent others).

| Model | Test RMSE | Test MAE | Test R² |
|-------|-----------|----------|---------|
| Persistence baseline | 0.7739 | 0.4996 | 0.6556 |
| Linear Regression | 0.7556 | 0.6035 | 0.6717 |
| Ridge (α=10) | 0.7641 | 0.6156 | 0.6642 |
| Random Forest | 0.5842 | 0.4032 | 0.8037 |
| **Tuned HistGradientBoosting** | **0.5378** | **0.3608** | **0.8337** |

≈ **30.5%** RMSE improvement vs baseline.  
Split: chronological **70% / 15% / 15%** + `TimeSeriesSplit` tuning.

---

## 8. Repository layout

```text
Business_Stats_AirQuality_Project/
├── dataset/air+quality/     # Original UCI files (do not edit)
├── data/cleaned/            # cleaned_air_quality.csv
├── notebooks/               # 01–04 academic notebooks
├── artifacts/               # model.joblib, metrics.json, feature_schema.json, …
├── figures/                 # EDA / evaluation plots
├── backend/                 # FastAPI app
├── frontend/                # React + Vite + TypeScript + Tailwind
├── reports/                 # Formal report + viva script
├── docs/                    # Team briefs, plans, decisions
├── start_project.ps1 / .bat # Local launchers
├── requirements.txt         # Root Python (notebooks + tools)
├── Procfile / render.yaml   # Render API deploy
└── test_backend_api.py      # API smoke tests
```

---

## 9. Docs for teammates

| Document | When to read |
|----------|----------------|
| [`docs/TEAM_PROJECT_BRIEF.md`](docs/TEAM_PROJECT_BRIEF.md) | Full idea, decisions, status |
| [`docs/PROJECT_ONE_PAGER.md`](docs/PROJECT_ONE_PAGER.md) | Short share sheet |
| [`docs/SYSTEM_AND_DECISIONS.md`](docs/SYSTEM_AND_DECISIONS.md) | Architecture + file map |
| [`docs/USEFULNESS_AND_LIMITATIONS.md`](docs/USEFULNESS_AND_LIMITATIONS.md) | Monitoring usefulness narrative |
| [`reports/VIVA_PRESENTATION_SCRIPT_AND_QA.md`](reports/VIVA_PRESENTATION_SCRIPT_AND_QA.md) | 8–10 min viva script |

Reports also live in `reports/` (`.md`, `.html`, `.pdf`).

---

## 10. Group 3 team roster

| Name | Role |
|------|------|
| **Farhan Sayed** | System Architect & Data Engineering Lead |
| **Salman Khan** | Predictive Modelling Lead |
| **Sahil Tambe** | Statistical Analysis & EDA Lead |
| **Shruti Pawar** | Insights & Visualization Lead |
| **Aayesha Kaliwala** | Validation & Evaluation Lead |
| **Kashish Maurya** | Documentation, Report & Viva Lead |

---

## 11. Deploy to Render (API) + Vercel (frontend)

Do this **after** the latest code is pushed to GitHub `main`.

### A. Push to GitHub first

```powershell
git add .
git status
git commit -m "Complete AirWatch CO academic core, dashboard, and docs"
git push origin main
```

### B. Deploy API on Render

1. Go to [https://dashboard.render.com](https://dashboard.render.com) → sign in (GitHub).
2. **New → Web Service** → connect `Business_Stats_AirQuality_Project`.
3. Settings:
   - **Root Directory:** leave empty (repo root).
   - **Runtime:** Python 3.
   - **Build Command:**  
     `pip install -r requirements.txt -r backend/requirements.txt`
   - **Start Command:**  
     `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
4. Create the service (Free tier is fine for demo). Wait until deploy is **Live**.
5. Open `https://YOUR-SERVICE.onrender.com/health` — expect `{"status":"ok"}` (or similar ok payload).
6. Copy your API base URL, e.g. `https://airwatch-co-api.onrender.com`.

> Tip: You can also use **Blueprint** → `render.yaml` from the repo root. After first deploy, you will still update `ALLOWED_ORIGINS` in step D.

### C. Deploy frontend on Vercel

1. Go to [https://vercel.com](https://vercel.com) → sign in with GitHub.
2. **Add New Project** → import the same repo.
3. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist`
4. **Environment Variables** (Production):
   - Name: `VITE_API_URL`
   - Value: your Render URL **with no trailing slash**  
     Example: `https://airwatch-co-api.onrender.com`
5. Deploy. Copy the Vercel URL, e.g. `https://airwatch-co.vercel.app`.

### D. Wire CORS (required)

1. Render dashboard → your API service → **Environment**.
2. Add / edit:
   - Key: `ALLOWED_ORIGINS`
   - Value: your Vercel origin(s), comma-separated if needed  
     Example: `https://airwatch-co.vercel.app,https://airwatch-co-xxxx.vercel.app`
3. Save → service redeploys.
4. Open the Vercel site → confirm navbar shows **API ACTIVE** and Predict Lab works.

### E. After deploy — update the Team page / README

Paste the live URLs where teammates look for them (Team page “Demo URLs” note and this README table at the top).

---

## 12. Troubleshooting

| Problem | Fix |
|---------|-----|
| `uvicorn` / imports fail | Activate `.venv`, reinstall `pip install -r requirements.txt -r backend/requirements.txt`, run from **repo root** |
| Frontend blank / API OFFLINE | Start backend on 8000; hard-refresh UI (`Ctrl+Shift+R`) |
| `npm` errors | Use Node 18+; delete `frontend/node_modules` and run `npm install` again |
| Predict fails locally | Confirm `artifacts/model.joblib` and `data/cleaned/cleaned_air_quality.csv` exist |
| Cloud UI loads but API blocked | Set `ALLOWED_ORIGINS` on Render to the exact Vercel `https://…` origin |
| Cloud UI calls localhost | Rebuild Vercel with `VITE_API_URL` set to the Render URL |
| Render cold start slow | Free tier sleeps; first request after idle can take ~30–60s |

---

## 13. License / data credit

UCI Air Quality Data Set — S. De Vito et al. (CNR-ISAC, Italy). Used for academic coursework only.

---

*Group 3 · AirWatch CO — clone → setup → run → (optional) Render + Vercel.*
