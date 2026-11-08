# AirWatch CO — One-Pager

**MCA I Statistics | Group 3 — Air Quality and Pollution**

---

### Idea
Predict **next-hour Carbon Monoxide** (`CO_next`) from the UCI Air Quality hourly station data using only features known at time *t* — no future leakage.

### Problem
Roadside CO spikes with traffic and weather. We need a **1-hour-ahead** statistical forecast that is honest, time-aware, and explainable for monitoring usefulness and limits.

### What we deliver
1. **Academic:** Python notebooks → cleaned CSV → tuned model → report  
2. **Demo:** FastAPI + React **AirWatch CO** dashboard (glass / sky UI)

### Locked choices
- Target: `CO(GT)` at *t+1*  
- Split: chronological **70 / 15 / 15** + `TimeSeriesSplit`  
- Champion: **HistGradientBoosting**  
- Metrics: RMSE · MAE · R²  

### Holdout results (`artifacts/metrics.json`)

| | RMSE | MAE | R² |
|--|------|-----|----|
| Baseline (persist) | 0.774 | 0.500 | 0.656 |
| **Champion HGB** | **0.538** | **0.361** | **0.834** |

≈ **30.5%** RMSE improvement vs baseline.

### Critical data rule
Replace **`-200`** with missing — it is a sentinel, not a real concentration.

### Dashboard pages
Home · Explore · Insights · Predict Lab · Evaluation · Team

### Run locally
`start_project.bat` **or** API `:8000` + `frontend` `:5173`

### Group 3
Farhan Sayed · Salman Khan · Sahil Tambe · Shruti Pawar · Aayesha Kaliwala · Kashish Maurya

### Still open
- Optional Vercel + Render public URLs  

### Say in viva
Time-ordered split prevents leakage · tree model beats linear/baseline · errors grow on extreme peaks · single station · 1-hour horizon only.

### Full brief
→ [TEAM_PROJECT_BRIEF.md](TEAM_PROJECT_BRIEF.md) · [SYSTEM_AND_DECISIONS.md](SYSTEM_AND_DECISIONS.md)
