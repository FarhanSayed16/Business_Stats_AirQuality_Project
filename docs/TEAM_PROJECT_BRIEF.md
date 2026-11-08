# AirWatch CO — Team Project Brief

**Course:** MCA I Statistics Internal Assessment  
**Group:** Group 3 — Air Quality and Pollution  
**Product name:** AirWatch CO (Urban Atmospheric Intelligence)  
**Audience:** Teammates sharing ownership of the submission and viva demo

---

## 1. Exact idea (what this project is)

We take the **UCI Air Quality** hourly dataset (Italian urban roadside station, March 2004–April 2005) and answer a clear research question:

> Using only information available **up to the current hour** (weather, metal-oxide sensors, and current pollutants), can we predict **next-hour true Carbon Monoxide** `CO(GT)` without leaking future data?

The academic core is **Python** (notebooks → cleaned data → models → report).  
The optional presentation layer is **AirWatch CO**: a FastAPI API + React dashboard so the class/viva can explore data, insights, and live next-hour predictions.

---

## 2. Problem statement

| Element | Statement |
|---------|-----------|
| **Problem** | Urban CO varies with traffic and weather; monitoring stations record it hourly, but operators need short-horizon foresight. |
| **Task** | Forecast **next-hour** reference CO concentration (`CO_next = CO(GT).shift(-1)`). |
| **Constraint** | No future leakage — chronological train/val/test and time-aware CV only. |
| **Data quirk** | Invalid / missing sensor values are coded as **`-200`**, not blanks. Ignoring this breaks every statistic. |
| **Success** | Honest metrics (RMSE, MAE, R²), interpretable EDA, usefulness/limitations write-up, and a runnable demo. |

---

## 3. Locked decisions (do not reopen casually)

| Decision | Choice |
|----------|--------|
| App / brand | **AirWatch CO** |
| Target | Next-hour **`CO(GT)`** |
| Split | Chronological **70% train / 15% val / 15% test** |
| Validation | `TimeSeriesSplit` (not random K-fold) |
| Champion model | Tuned **HistGradientBoostingRegressor** |
| Metrics | RMSE, MAE, R² (plus % RMSE gain vs persistence baseline) |
| Academic stack | Python notebooks + `data/cleaned/` + `reports/` |
| Demo stack | FastAPI (`backend/`) + React/Vite/TS/Tailwind/Recharts (`frontend/`) |
| Artifacts API reads | `model.joblib`, `metrics.json`, `feature_schema.json`, `missingness.json` |
| UI theme | Soft sky atmosphere + **glassmorphism** panels |
| Cloud deploy | Frontend → Vercel, API → Render (**optional**; local demo is enough for class) |
| Out of scope | Login, live city AQI APIs, mobile apps, auto-retrain MLOps, chatbot |

---

## 4. What we built (system status)

### Academic pipeline (complete)

| Piece | Location | Status |
|-------|----------|--------|
| Preprocessing notebook | `notebooks/01_preprocessing.ipynb` | Done |
| EDA notebook | `notebooks/02_eda.ipynb` | Done |
| Modelling notebook | `notebooks/03_modelling.ipynb` | Done |
| Tuning & evaluation | `notebooks/04_tuning_evaluation.ipynb` | Done |
| Cleaned dataset | `data/cleaned/cleaned_air_quality.csv` | Done (~9,353 hourly rows after cleaning) |
| Model + metrics | `artifacts/` | Done |
| Figures | `figures/` | Done |
| Formal report (MD/HTML/PDF) | `reports/` | Done |
| Usefulness & limitations | `docs/USEFULNESS_AND_LIMITATIONS.md` + report sections | Done |
| Viva script | `reports/VIVA_PRESENTATION_SCRIPT_AND_QA.md` | Done |

### Demo system (complete locally)

| Piece | Location | Status |
|-------|----------|--------|
| FastAPI app | `backend/app/` | Done — health, stats, data, model/predict |
| React dashboard | `frontend/src/pages/` | Done — Home, Explore, Insights, Predict, Evaluation, Team |
| CORS allow-list | `backend/app/main.py` + `ALLOWED_ORIGINS` | Done |
| One-click launchers | `start_project.bat` / `start_project.ps1` | Done |
| Deploy configs | `render.yaml`, `frontend/vercel.json`, root `Procfile` | Ready (not yet live unless you deploy) |
| Backend API tests | `test_backend_api.py` | Passing when API is up |

### Still for humans (before final submit)

1. Fill **Member 02–16** legal names/roles on the Team page (16-seat roster; only Farhan detailed for now) and update report contributions.  
2. Optional: deploy Render + Vercel and paste public URLs into README / Team page.  
3. Rehearse the 8–10 minute viva once on the local stack.

---

## 5. Champion model results (holdout test)

Source of truth: `artifacts/metrics.json`.

| Model | Test RMSE | Test MAE | Test R² |
|-------|-----------|----------|---------|
| Persistence baseline (`ŷ = current CO`) | 0.7739 | 0.4996 | 0.6556 |
| Linear Regression | 0.7556 | 0.6035 | 0.6717 |
| Ridge (`α=10`) | 0.7641 | 0.6156 | 0.6642 |
| Random Forest | 0.5842 | 0.4032 | 0.8037 |
| **Tuned HistGradientBoosting (champion)** | **0.5378** | **0.3608** | **0.8337** |

- **~30.5% RMSE reduction** vs persistence baseline on holdout.  
- Best hyperparameters (TimeSeriesSplit-tuned): `learning_rate=0.1`, `max_iter=100`, `max_depth=10`, `min_samples_leaf=20`, `l2_regularization=0.5`.  
- Top drivers (permutation importance): current `CO(GT)`, diurnal encodings (`hour_cos` / `hour_sin`), `PT08.S1(CO)`.

### Honest limitations (say this in viva)

- Error rises on **extreme peaks** (model underestimates rare spikes).  
- Single Italian station — not transferable without recalibration.  
- Horizon is **t+1 hour only**.  
- No wind, traffic counts, or event shocks in the feature set.

---

## 6. How to run the full demo (local)

**One-click (Windows):**

```text
start_project.bat
```

or PowerShell:

```powershell
.\start_project.ps1
```

**Manual:**

```text
# Terminal 1 — API
uvicorn backend.app.main:app --reload --port 8000

# Terminal 2 — UI
cd frontend
npm run dev
```

| Service | URL |
|---------|-----|
| Dashboard | http://127.0.0.1:5173 |
| API docs | http://127.0.0.1:8000/docs |
| Health | http://127.0.0.1:8000/health |

---

## 7. Suggested ownership (3–4 members)

| Role | Owns | Must be able to explain |
|------|------|-------------------------|
| Data Lead | Preprocessing, `-200`, cleaned CSV, Explore page data story | Why sentinel values matter |
| EDA Lead | Insights charts, diurnal/weekday/weather findings | What patterns mean for CO |
| Modelling Lead | Models, tuning, Evaluation + Predict | Why time-series split / no leakage |
| Product Lead | Dashboard polish, report packaging, demo flow | End-to-end narrative |

Everyone should walk Home → Explore → Insights → Predict → Evaluation → Team once before viva.

---

## 8. Submission bundle checklist

- [x] Python notebooks / scripts  
- [x] Cleaned dataset  
- [x] Report (approach, findings, results, limitations)  
- [ ] Final legal names in contribution section  
- [x] Runnable AirWatch CO demo (local)  
- [ ] Optional cloud URLs  

---

## 9. Related docs

| Doc | Use when |
|-----|----------|
| [PROJECT_ONE_PAGER.md](PROJECT_ONE_PAGER.md) | Fast share / WhatsApp / slide backup |
| [SYSTEM_AND_DECISIONS.md](SYSTEM_AND_DECISIONS.md) | Architecture + file/API detail |
| [MASTER_PROJECT_PLAN.md](MASTER_PROJECT_PLAN.md) | Full phase history |
| [MASTER_EXECUTION_CHECKLIST.md](MASTER_EXECUTION_CHECKLIST.md) | Tick-box tracker |
| [USEFULNESS_AND_LIMITATIONS.md](USEFULNESS_AND_LIMITATIONS.md) | Monitoring usefulness narrative |
| [DATA_UNDERSTANDING.md](DATA_UNDERSTANDING.md) | Column dictionary deep dive |

---

*Group 3 — AirWatch CO. Share this file first when onboarding a teammate.*
