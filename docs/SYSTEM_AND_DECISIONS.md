# AirWatch CO — System & Decisions

**Purpose:** Concise technical map of what exists in the repo, why key choices were locked, and how the pieces connect. Use with [TEAM_PROJECT_BRIEF.md](TEAM_PROJECT_BRIEF.md).

---

## 1. Architecture (as built)

```text
UCI AirQualityUCI.csv  (dataset/air+quality/)
        │
        ▼
Python notebooks 01 → 04
        │
        ├──► data/cleaned/cleaned_air_quality.csv
        ├──► artifacts/model.joblib
        ├──► artifacts/metrics.json
        ├──► artifacts/feature_schema.json
        ├──► artifacts/missingness.json
        ├──► figures/*.png
        └──► reports/* (MD / HTML / PDF)
                │
                ▼
        FastAPI (backend/app)  ←── loads cleaned CSV + artifacts
                │
                ▼
        React dashboard (frontend/)  ←── typed client → API
```

**Local ports:** API `8000` · Vite UI `5173`  
**Optional cloud:** API on Render · UI on Vercel (`VITE_API_URL` + `ALLOWED_ORIGINS`)

---

## 2. Locked product & modelling decisions

| Topic | Decision | Why |
|-------|----------|-----|
| Brand | AirWatch CO | Clear class/demo identity |
| Target | `CO_next = CO(GT).shift(-1)` | Matches brief: next-hour true CO |
| Sentinel | `-200` → NaN | UCI encoding; treating as numeric destroys results |
| NMHC(GT) | Dropped / heavily missing | Too sparse for reliable modelling |
| Split | Chronological 70/15/15 | Avoids random shuffle leakage on autocorrelated series |
| CV | `TimeSeriesSplit` | Hyperparams tuned without peeking at future folds |
| Champion | HistGradientBoosting | Best holdout RMSE/MAE/R² among candidates |
| Dashboard numbers | From API/`metrics.json` only | Single source of truth with notebooks |
| Auth / live AQI | Out of scope | Keeps IA focused and demoable |

---

## 3. Holdout metrics (authoritative)

From `artifacts/metrics.json` — **do not invent alternate numbers in slides**.

| Model | Test RMSE | Test MAE | Test R² |
|-------|-----------|----------|---------|
| Persistence_Baseline | 0.7739 | 0.4996 | 0.6556 |
| Linear_Regression | 0.7556 | 0.6035 | 0.6717 |
| Ridge_Regression | 0.7641 | 0.6156 | 0.6642 |
| Random_Forest | 0.5842 | 0.4032 | 0.8037 |
| **Tuned_HistGradientBoosting** | **0.5378** | **0.3608** | **0.8337** |

Primary improvement: **30.5%** RMSE reduction vs baseline.  
Tuned params: `learning_rate=0.1`, `max_iter=100`, `max_depth=10`, `min_samples_leaf=20`, `l2_regularization=0.5`.

Dataset window after cleaning: **2004-03-10 → 2005-04-04**, **9,353** modelling rows (train 6547 / val 1403 / test 1403).

---

## 4. Repository map (what each folder is for)

| Path | Role |
|------|------|
| `dataset/air+quality/` | Original UCI files (do not overwrite) |
| `data/cleaned/` | Submission cleaned CSV |
| `notebooks/` | Academic core (01–04) |
| `artifacts/` | Model + metrics + schema for API |
| `figures/` | Report / Insights plots |
| `backend/` | FastAPI service |
| `frontend/` | React AirWatch CO UI |
| `reports/` | Formal report + viva script |
| `docs/` | Plans + team briefs |
| `IMAGES/` | Design / atmosphere source images |
| `frontend/public/bg-atmosphere.png` | Live dashboard background |
| `start_project.*` | One-click local launch |
| `render.yaml` / `Procfile` | Render API deploy |
| `frontend/vercel.json` | SPA routing on Vercel |
| `test_backend_api.py` | Smoke tests against local API |

---

## 5. API surface (demo layer)

Typical routers under `backend/app/routers/`:

| Area | Examples | Used by |
|------|----------|---------|
| System | `/health`, `/meta` | Navbar status, Team |
| Stats / overview | overview KPIs, weather/sensor means | Home |
| Data | paginated rows, filters, missingness | Explore |
| Patterns / correlation | diurnal, weekday, weather links | Insights |
| Model | info, evaluation table, `/predict` | Predict, Evaluation |

CORS: explicit allow-list (localhost + optional `ALLOWED_ORIGINS` env for production frontend URL).

Frontend client: `frontend/src/api/client.ts`  
Env for cloud: `VITE_API_URL=<Render base URL>` (build-time).

---

## 6. UI pages & design decisions

| Page | Job |
|------|-----|
| Home | Story, KPIs, champion snapshot, CO gauge |
| Explore | Filter cleaned telemetry; missingness audit |
| Insights | EDA charts (diurnal, weather, correlations) |
| Predict | Replay holdout hour or custom scenario → next-hour CO |
| Evaluation | Model table, importance, error story |
| Team | Members, stack, report links |

**Visual:** soft scenic sky background + frosted **glass** cards (`glass-panel`, `glass-panel-strong`, `glass-inner`, `glass-soft` in `frontend/src/index.css`). Sky accent `#0284c7` — not teal/green.

---

## 7. What “done” means vs what remains

### Done
- Full Python academic pipeline  
- Artifacts synced with dashboard metrics  
- FastAPI + React local demo  
- Report HTML/MD/PDF + viva notes  
- Deploy configs prepared  

### Remaining (human)
| Item | Owner action |
|------|----------------|
| Member 02–16 names/roles | Edit Team page (16 seats) + report contributions |
| Optional cloud deploy | Render service + Vercel project + CORS/`VITE_API_URL` |
| Final viva rehearsal | Run `start_project` once end-to-end |

---

## 8. Cloud deploy outline (optional)

1. Push latest `main` to GitHub.  
2. Render: new Web Service from repo root — start `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT` (see `render.yaml`).  
3. Confirm `GET /health` on the Render URL.  
4. Vercel: deploy `frontend/` with `VITE_API_URL` = Render URL.  
5. Set Render `ALLOWED_ORIGINS` to the Vercel origin(s).  
6. Paste both URLs into README and Team page.

Until then, **localhost is the official demo path**.

---

## 9. Document index

| File | Role |
|------|------|
| [TEAM_PROJECT_BRIEF.md](TEAM_PROJECT_BRIEF.md) | Full teammate briefing |
| [PROJECT_ONE_PAGER.md](PROJECT_ONE_PAGER.md) | Punch-size summary |
| This file | System + decisions |
| [PROJECT_IDEA_AND_EXECUTION_PLAN.md](PROJECT_IDEA_AND_EXECUTION_PLAN.md) | Original academic scope |
| [MASTER_PROJECT_PLAN.md](MASTER_PROJECT_PLAN.md) | Phased build plan |
| [MASTER_EXECUTION_CHECKLIST.md](MASTER_EXECUTION_CHECKLIST.md) | Checkboxes |
| [SYSTEM_AUDIT_AND_ENHANCEMENT.md](SYSTEM_AUDIT_AND_ENHANCEMENT.md) | Audit / fix waves |
| [ENHANCEMENT_WEB_DASHBOARD_PLAN.md](ENHANCEMENT_WEB_DASHBOARD_PLAN.md) | Dashboard design intent |
| [USEFULNESS_AND_LIMITATIONS.md](USEFULNESS_AND_LIMITATIONS.md) | Monitoring narrative |
| [DATA_UNDERSTANDING.md](DATA_UNDERSTANDING.md) | Variable dictionary |

---

*Keep metrics and claims aligned with `artifacts/metrics.json` and the notebooks.*
