# Master Project Plan — AirWatch CO  
## MCA I Statistics Internal Assessment | Group 3 — Air Quality and Pollution  
### End-to-end execution plan (Python academic core + FastAPI + React dashboard)

---

## Document map

| Document | Purpose |
|----------|---------|
| **This file** — [MASTER_PROJECT_PLAN.md](MASTER_PROJECT_PLAN.md) | Full phased plan, sub-phases, artifacts, exit criteria |
| [MASTER_EXECUTION_CHECKLIST.md](MASTER_EXECUTION_CHECKLIST.md) | Daily checkbox tracker (tick as you finish) |
| [SYSTEM_AUDIT_AND_ENHANCEMENT.md](SYSTEM_AUDIT_AND_ENHANCEMENT.md) | Post-build audit, gaps, prioritized fix waves |
| [PROJECT_IDEA_AND_EXECUTION_PLAN.md](PROJECT_IDEA_AND_EXECUTION_PLAN.md) | Academic scope, dataset, required tasks |
| [ENHANCEMENT_WEB_DASHBOARD_PLAN.md](ENHANCEMENT_WEB_DASHBOARD_PLAN.md) | Dashboard screens, enhancement rationale |

**How to use:** Execute phases **1 → 13 in order**. Do not start Phase 9–10 UI work until Phase 6 artifacts exist. Tick items in the checklist file as each sub-phase completes. A phase is done only when its **Exit criteria** are met.

---

## 1. Locked project decisions

| Decision | Locked choice |
|----------|---------------|
| App name | **AirWatch CO** |
| Academic core | Python notebooks/scripts + cleaned dataset + report |
| Presentation layer | FastAPI (Python) + React (Vite + TypeScript) |
| Charts | Recharts |
| UI styling | Tailwind CSS |
| Model artifacts | `model.joblib` + `metrics.json` + `feature_schema.json` |
| Deploy | Frontend → **Vercel**; API → **Render** |
| Prediction target | Next-hour **`CO(GT)`** (`CO_next = CO(GT).shift(-1)`) |
| Validation | Chronological split + `TimeSeriesSplit` (no random leakage) |
| Models | Baseline + Ridge/Linear + RandomForest **or** HistGradientBoosting |
| Metrics | RMSE, MAE, R² |
| Official brief language | Python-only for analysis; React is demo UI only |

### Official college deliverables (never skip)

1. Python notebook(s)/scripts — preprocess → EDA → model → tune → evaluate  
2. Cleaned dataset  
3. Report — approach, findings, results, limitations, member contributions  

### Enhancement deliverables

4. FastAPI backend serving cleaned data + predictions  
5. React dashboard (6 pages)  
6. Deployed public URL for class/viva  

---

## 2. End-to-end architecture

```text
Raw UCI CSV
    → Python notebooks (preprocess, EDA, model, tune)
        → cleaned_air_quality.csv
        → model.joblib + metrics.json + feature_schema.json
        → college report PDF
    → FastAPI loads cleaned data + artifacts
        → React dashboard (Vercel) calls API (Render)
```

### Target repository structure

```text
Business_Stats_AirQuality_Project/
├── dataset/air+quality/          # original UCI files (unchanged)
├── data/cleaned/                 # cleaned_air_quality.csv
├── notebooks/
│   ├── 01_preprocessing.ipynb
│   ├── 02_eda.ipynb
│   ├── 03_modelling.ipynb
│   └── 04_tuning_evaluation.ipynb
├── artifacts/
│   ├── model.joblib
│   ├── metrics.json
│   └── feature_schema.json
├── figures/                      # EDA / model plots for report
├── backend/                      # FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   ├── services/
│   │   └── schemas/
│   └── requirements.txt
├── frontend/                     # React + Vite + TS
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/
│   │   └── styles/
│   └── package.json
├── reports/                      # final PDF/DOC
├── docs/                         # plans + this master plan
├── README.md
└── requirements.txt              # root Python deps for notebooks
```

---

## 3. Suggested team ownership

| Role | Primary phases | Focus |
|------|----------------|-------|
| Member A — Data Lead | 1–3, support 7–8 | Preprocessing, cleaned data, data API |
| Member B — EDA Lead | 4, support 10 Insights | Charts, insight copy, report EDA |
| Member C — Modelling Lead | 5–6, support 8 Predict | Models, tuning, artifacts, predict API |
| Member D — Product Lead | 9–13 | React UI, deploy, report assembly, presentation |

If only 3 members: merge C+D or A+B; everyone still reviews the full pipeline for viva.

---

## 4. Out of scope (do not build)

- User login / authentication  
- Live external city AQI APIs  
- Mobile native apps  
- MLOps auto-retraining pipelines  
- More than 3 model families  
- Chatbot / AI assistant features  
- Complex GIS maps (not required)

---

# PHASES (1–13)

---

## Phase 1 — Project kickoff and environment

### Objective
Set up a reproducible workspace so the whole team can run the same Python and (later) React stack without friction.

### Suggested owner
Member D (scaffold) + Member A (Python env)

### Sub-phases

#### 1.1 Brief and scope lock
- Re-read college brief (Air Quality and Pollution, 21 days, Python analysis required).  
- Confirm allotted dataset path: `dataset/air+quality/AirQualityUCI.csv`.  
- Confirm enhancement path: FastAPI + React (AirWatch CO).  
- Assign member roles (Section 3 above).  

#### 1.2 Repository folder skeleton
- Create empty folders: `notebooks/`, `data/cleaned/`, `artifacts/`, `figures/`, `reports/`, `backend/`, `frontend/`.  
- Keep `docs/` plans in place.  
- Add `.gitignore` entries for `__pycache__/`, `.venv/`, `node_modules/`, `.env`, large caches.  

#### 1.3 Python environment
- Create virtual environment (`.venv`).  
- Install baseline packages: `pandas`, `numpy`, `matplotlib`, `seaborn`, `scikit-learn`, `joblib`, `openpyxl`, `jupyter`.  
- Write root `requirements.txt` with pinned or minimum versions.  

#### 1.4 Node toolchain check
- Verify Node.js LTS installed (for later Vite/React).  
- Record Node and npm versions in README.  

#### 1.5 README stub
- Project title, Group 3, objective one-liner.  
- How to activate venv and open notebooks.  
- Placeholder sections for API and frontend run commands.  

#### 1.6 Smoke load raw data
- In a scratch cell or tiny script, load CSV with `sep=';'` and `decimal=','`.  
- Print shape, columns, first 3 rows.  

### Artifacts produced
- Folder skeleton  
- `.venv` + root `requirements.txt`  
- `README.md` stub  
- Confirmed raw CSV load output  

### Exit criteria
- [ ] Repo structure exists and is documented  
- [ ] Any teammate can activate venv and import pandas  
- [ ] Raw `AirQualityUCI.csv` loads without parse errors  

---

## Phase 2 — Data understanding

### Objective
Fully understand variables, quirks, and freeze the modelling target/feature rules before cleaning.

### Suggested owner
Member A + Member B

### Sub-phases

#### 2.1 Variable dictionary
- Document every column: meaning, unit, role (target / sensor / weather / time).  
- Align with UCI Air Quality descriptions.  

#### 2.2 Format and quality quirks
- Confirm separator `;` and decimal `,`.  
- Confirm invalid values coded as **`-200`** (not NaN).  
- Note trailing empty columns if present.  

#### 2.3 Missingness profile (raw)
- Replace `-200` temporarily for profiling; count % missing per column.  
- Flag extreme-missing columns (especially `NMHC(GT)`).  

#### 2.4 Target freeze
- Define **`CO_next` = next hour’s `CO(GT)`**.  
- Document that prediction uses only information available at hour `t`.  

#### 2.5 Feature policy freeze
- Allowed at time `t`: current pollutants/sensors/weather, lags of past hours, calendar fields from timestamp.  
- Forbidden: any value from hour `t+1` or later (no leakage).  

#### 2.6 Data-understanding write-up
- Short notes in notebook markdown or `docs/` snippet for report Section 2.  

### Artifacts produced
- Variable dictionary (in notebook or docs)  
- Missingness profile table  
- Written target + feature policy  

### Exit criteria
- [ ] Team agrees on `CO_next` definition  
- [ ] `-200` handling rule is documented  
- [ ] Leakage rules are written and shared  

---

## Phase 3 — Data preprocessing

### Objective
Produce a reproducible cleaned, analysis-ready dataset and modelling table.

### Suggested owner
Member A

### Sub-phases

#### 3.1 Parsing and typing
- Combine `Date` + `Time` into a proper datetime index.  
- Coerce numeric columns correctly after European decimal handling.  
- Sort by datetime; drop fully empty rows.  

#### 3.2 Invalid value handling
- Replace all `-200` with NaN across numeric columns.  
- Generate before/after missingness report.  

#### 3.3 Column decisions
- Drop columns with unjustifiable missingness (justify, e.g. `NMHC(GT)` if ~90% missing).  
- Keep sensors, weather, and usable ground-truth pollutants.  

#### 3.4 Imputation strategy
- Choose time-aware approach (e.g. limited forward-fill for short gaps, hour-of-day median, or drop rows for modelling).  
- Justify each choice in notebook markdown (required for marks).  

#### 3.5 Feature engineering
- Calendar: `hour`, `dayofweek`, `month` (and optionally weekend flag).  
- Lags: `CO(GT)` lag 1–3 (and optional sensor lags).  
- Optional rolling: 3-hour mean of CO or key sensors.  
- Create target `CO_next`.  
- Drop last row(s) where `CO_next` is NaN.  

#### 3.6 Chronological split masks
- Define train / validation / test by time order (e.g. 70/15/15 or 60/20/20).  
- Save split boundaries (timestamps) for report and API consistency.  

#### 3.7 Export cleaned data
- Write `data/cleaned/cleaned_air_quality.csv`.  
- Include columns needed for EDA, modelling, and dashboard.  
- Document schema in notebook.  

#### 3.8 Preprocessing notebook polish
- Complete `notebooks/01_preprocessing.ipynb` as submission-quality.  
- Draft report “Preprocessing” section bullets.  

### Artifacts produced
- `notebooks/01_preprocessing.ipynb`  
- `data/cleaned/cleaned_air_quality.csv`  
- Missingness report + split boundary notes  

### Exit criteria
- [ ] Cleaned CSV exists and reloads cleanly  
- [ ] No `-200` values remain in cleaned numerics  
- [ ] `CO_next` and lag features present  
- [ ] Split strategy documented  

---

## Phase 4 — Exploratory data analysis

### Objective
Answer how pollution changes over time and how it relates to weather and sensors; produce figures and insight copy for report + UI.

### Suggested owner
Member B

### Sub-phases

#### 4.1 Univariate summaries
- Describe distributions for `CO(GT)`, key pollutants, sensors, `T`, `RH`, `AH`.  
- Note outliers and skew.  

#### 4.2 Time behaviour
- Plot CO over the full period.  
- Average CO by hour-of-day.  
- Average CO by day-of-week.  
- Comment on rush-hour / weekly patterns.  

#### 4.3 Weather relationships
- Scatter or joint views: CO vs T, RH, AH.  
- Short interpretation (correlation direction/strength).  

#### 4.4 Sensor and pollutant associations
- Correlation heatmap among usable numeric features.  
- Highlight strongest correlates of CO.  

#### 4.5 Data-quality visuals
- Missingness before vs after cleaning (bar chart).  
- Optional boxplots for key variables.  

#### 4.6 Insight cards copy
- Write 4–8 short bullets usable on the Insights page (only claims supported by plots).  

#### 4.7 Export figures
- Save PNGs to `figures/` with clear filenames.  
- Complete `notebooks/02_eda.ipynb`.  

### Artifacts produced
- `notebooks/02_eda.ipynb`  
- `figures/*`  
- Insight card text for dashboard  

### Exit criteria
- [ ] Time, weather, and correlation analyses complete  
- [ ] Figures saved for report  
- [ ] Insight bullets reviewed by team  

---

## Phase 5 — Baseline and predictive modelling

### Objective
Build honest baselines and candidate models for next-hour CO prediction; compare fairly on a time-aware validation set.

### Suggested owner
Member C

### Sub-phases

#### 5.1 Modelling frame
- Load cleaned data; select feature columns from `feature` policy.  
- Separate X/y; respect chronological train/val/test.  

#### 5.2 Baseline model
- Implement naive baseline (e.g. predict `CO_next` = current `CO(GT)`).  
- Record RMSE/MAE/R² on validation (and later test).  

#### 5.3 Interpretable model
- Fit Linear Regression and/or Ridge.  
- Inspect coefficients for statistical story in report.  

#### 5.4 Non-linear model
- Fit RandomForestRegressor **or** HistGradientBoostingRegressor.  
- Keep defaults sane; full tuning is Phase 6.  

#### 5.5 Evaluation toolkit
- Shared metric functions (RMSE, MAE, R²).  
- Actual vs predicted scatter; residual histogram.  

#### 5.6 Model comparison table
- Side-by-side metrics for Baseline / Linear-Ridge / Tree model.  
- Select tuning candidate (usually best non-baseline on validation).  

#### 5.7 Modelling notebook
- Complete `notebooks/03_modelling.ipynb` with justifications.  

### Artifacts produced
- `notebooks/03_modelling.ipynb`  
- Comparison table + residual figures in `figures/`  

### Exit criteria
- [ ] Baseline and ≥2 real models trained  
- [ ] Validation metrics tabulated  
- [ ] Candidate model chosen for tuning  

---

## Phase 6 — Hyperparameter tuning and final evaluation

### Objective
Tune the chosen model with time-series CV, evaluate on holdout test, export artifacts the API will serve, and draft usefulness/limitations.

### Suggested owner
Member C

### Sub-phases

#### 6.1 Tuning setup
- Use `TimeSeriesSplit` (not random K-fold).  
- Define search space (e.g. depth, n_estimators, learning_rate, alpha).  

#### 6.2 Search and selection
- GridSearchCV or RandomizedSearchCV with time-series splits on train(+val) protocol you document.  
- Record best params and CV score.  

#### 6.3 Final holdout evaluation
- Refit best model; score on untouched test period.  
- Compare test metrics vs baseline.  

#### 6.4 Error / failure analysis
- Where errors are large (hour-of-day, high-CO episodes, missing-sensor periods).  
- Residual plots for report and Evaluation page.  

#### 6.5 Artifact export
- Save `artifacts/model.joblib`.  
- Save `artifacts/metrics.json` (baseline + models + best params + split dates + metric values).  
- Save `artifacts/feature_schema.json` (ordered feature names, dtypes, training notes).  

#### 6.6 Usefulness and limitations draft
- Usefulness for air-quality monitoring (short-horizon planning, sensor support).  
- Limitations (single station, historical period, missingness, next-hour only, no traffic/events).  

#### 6.7 Tuning notebook
- Complete `notebooks/04_tuning_evaluation.ipynb`.  
- Verify reloading `model.joblib` reproduces test metrics.  

### Artifacts produced
- `notebooks/04_tuning_evaluation.ipynb`  
- `artifacts/model.joblib`  
- `artifacts/metrics.json`  
- `artifacts/feature_schema.json`  
- Limitations draft text  

### Exit criteria
- [ ] Best hyperparameters documented  
- [ ] Test metrics finalized and match reloaded model  
- [ ] All three artifact files exist  
- [ ] Limitations draft approved by team  

**Gate:** Do not start serious frontend feature work until this phase exits.

---

## Phase 7 — Backend API foundation (FastAPI)

### Objective
Create a stable Python API that loads cleaned data and model artifacts and exposes health/meta endpoints.

### Suggested owner
Member A + Member C

### Sub-phases

#### 7.1 Scaffold backend
- Create `backend/app/main.py`, `routers/`, `services/`, `schemas/`.  
- Add `backend/requirements.txt` (`fastapi`, `uvicorn`, `pandas`, `scikit-learn`, `joblib`, `pydantic`).  

#### 7.2 Startup loading
- On startup, load cleaned CSV + `metrics.json` + `feature_schema.json` + `model.joblib`.  
- Fail clearly if artifacts missing.  

#### 7.3 CORS and config
- Enable CORS for local Vite origin (`http://localhost:5173`).  
- Use env vars for artifact paths where useful.  

#### 7.4 Core routes
- `GET /health` → status ok  
- `GET /meta` → project name, date range, row count, model name summary  

#### 7.5 Pydantic schemas
- Define response/request models for overview, filters, predict, evaluation.  

#### 7.6 Local run docs
- Document `uvicorn app.main:app --reload` from `backend/`.  

### Artifacts produced
- `backend/` scaffold  
- Working `/health` and `/meta`  

### Exit criteria
- [ ] `uvicorn` starts without error when artifacts present  
- [ ] `/health` returns 200  
- [ ] `/meta` reflects cleaned data summary  

---

## Phase 8 — Backend domain endpoints

### Objective
Expose all data, stats, and model endpoints required by the six dashboard pages.

### Suggested owner
Member A (data/stats) + Member C (model)

### Sub-phases

#### 8.1 Overview stats
- `GET /stats/overview` — KPIs: n_hours, date_range, mean/max CO, best model metrics.  

#### 8.2 Timeseries and patterns
- `GET /stats/timeseries` — CO (and optional downsampled points) with date filters.  
- `GET /stats/hourly-pattern` — mean CO by hour.  
- `GET /stats/weekday-pattern` — mean CO by weekday.  

#### 8.3 Relationships
- `GET /stats/correlation` — correlation matrix for selected columns.  
- `GET /stats/weather-scatter` — paired points for CO vs T/RH/AH (optional sampling).  

#### 8.4 Data explorer
- `GET /data` — filtered/paginated cleaned rows.  
- Support date range + hour filters.  
- Provide download path or full cleaned CSV static/serve option.  
- Include missingness summary payload (before/after if stored in metrics or a small JSON).  

#### 8.5 Model endpoints
- `GET /model/info` — model type, best params, feature list, train/test window.  
- `GET /model/sample-timestamps` — list of test-set timestamps for demo picker.  
- `POST /model/predict` — accept timestamp id **or** feature payload; return predicted CO (+ actual if historical).  
- `GET /model/evaluation` — metrics table, optional series for actual vs predicted.  

#### 8.6 Parity checks
- Spot-check that overview metrics equal `metrics.json`.  
- Spot-check one known timestamp prediction vs notebook.  

### Artifacts produced
- Complete FastAPI routers  
- OpenAPI docs at `/docs` usable for frontend  

### Exit criteria
- [ ] All Must-Have endpoints implemented  
- [ ] JSON numbers match notebook/`metrics.json`  
- [ ] Predict works for historical test timestamps  

---

## Phase 9 — Frontend foundation (React)

### Objective
Scaffold AirWatch CO UI shell: routing, layout, API client, empty pages, health badge.

### Suggested owner
Member D

### Sub-phases

#### 9.1 Vite app scaffold
- Create `frontend/` with Vite + React + TypeScript.  
- Install Tailwind, React Router, Recharts, fetch/axios helper.  

#### 9.2 Design tokens
- Define CSS variables: slate/teal accent, light theme, large chart fonts for projector.  
- Avoid generic purple-gradient AI look.  

#### 9.3 Layout and navigation
- App shell with top or side nav: Home, Explore, Insights, Predict, Evaluation, Team.  
- Footer with Group 3 + “MCA Statistics IA”.  

#### 9.4 API client
- Central module using `import.meta.env.VITE_API_URL`.  
- Typed helpers for health/meta/stats/model.  
- Shared loading and error UI components.  

#### 9.5 Page shells
- Create empty route components for all 6 pages.  
- Confirm client-side navigation works.  

#### 9.6 Health badge
- Home or header shows API online/offline from `/health`.  

### Artifacts produced
- `frontend/` app running locally  
- Six navigable page shells  

### Exit criteria
- [ ] `npm run dev` works  
- [ ] All routes reachable  
- [ ] Health badge reflects backend status  

---

## Phase 10 — Frontend feature pages

### Objective
Implement full dashboard features so the class demo can run without opening notebooks.

### Suggested owner
Member D + Member B (Insights copy) + Member C (Predict/Evaluation)

### Sub-phases

#### 10.1 Home
- Title AirWatch CO, Group 3, 2–3 line objective.  
- KPI cards from `/stats/overview`.  
- Best model name + RMSE/MAE/R².  
- CTAs to Explore / Insights / Predict.  
- Short “How to use” strip.  

#### 10.2 Explore
- Filterable table (date range, hour).  
- Variable dictionary tooltips.  
- Missingness summary (`-200` explanation).  
- Download cleaned CSV control.  

#### 10.3 Insights
- CO timeseries chart.  
- Hour-of-day and weekday pattern charts.  
- Weather vs CO scatter (selectable weather var).  
- Correlation heatmap.  
- Insight cards under sections.  

#### 10.4 Predict (Model Lab)
- Primary mode: select historical timestamp → autofill features → predict.  
- Show predicted next-hour CO vs actual.  
- Side panel: model info + hyperparameters.  
- Optional actual-vs-predicted chart for test set.  

#### 10.5 Evaluation
- Metrics comparison table (Baseline / Linear / Tuned).  
- Residual / error commentary.  
- Usefulness and limitations content.  

#### 10.6 Team
- Member names, roles, contributions (aligned with report).  
- Tech stack badges.  

#### 10.7 Local full demo path
- Walk Home → Explore → Insights → Predict → Evaluation without errors.  

### Artifacts produced
- Complete React pages wired to API  
- Presentation-ready local demo  

### Exit criteria
- [ ] All Must-Have UI features working locally  
- [ ] Predict-vs-actual demo reliable  
- [ ] No notebook required for the story  

---

## Phase 11 — Integration hardening

### Objective
Make the full stack demo-safe: correct numbers, resilient UI, acceptable performance.

### Suggested owner
All members (D leads)

### Sub-phases

#### 11.1 Metric parity audit
- Compare Home KPIs and Evaluation table to `metrics.json` and notebooks.  
- Fix any drift.  

#### 11.2 Empty and error states
- API down, empty filters, predict failure — clear messages, no blank crashes.  

#### 11.3 Presentation UX
- Increase base font/chart label sizes for projector.  
- Ensure one primary chart focus per Insights section.  

#### 11.4 Performance
- If timeseries is heavy, downsample/aggregate on API for chart endpoints.  
- Confirm Insights page loads in a few seconds.  

#### 11.5 CORS for future production
- Prepare allowed origins list (localhost + Vercel URL placeholder).  

#### 11.6 Dry run
- 15-minute unbroken local demo script with no crashes.  

### Artifacts produced
- Bugfix list closed  
- Dry-run notes  

### Exit criteria
- [ ] UI metrics == artifacts  
- [ ] 15-minute local dry-run passes  
- [ ] Error states verified  

---

## Phase 12 — Deployment

### Objective
Publish a stable public demo URL with a backup plan if Wi-Fi fails on presentation day.

### Suggested owner
Member D

### Sub-phases

#### 12.1 Backend on Render
- Deploy FastAPI service.  
- Include/access `data/cleaned` + `artifacts`.  
- Confirm `/health` on public API URL.  

#### 12.2 Frontend on Vercel
- Deploy React app.  
- Set `VITE_API_URL` to Render API.  
- Confirm CORS allows Vercel domain.  

#### 12.3 Production smoke test
- Home KPIs load.  
- Charts load.  
- Predict works for ≥5 sample timestamps.  
- Evaluation metrics visible.  

#### 12.4 Backup kit
- Localhost run instructions in README.  
- Screenshot appendix for report.  
- Optional 2-minute screen-capture demo video.  

#### 12.5 URL documentation
- Put production URLs in README and Team page.  

### Artifacts produced
- Live frontend URL  
- Live API URL  
- Backup materials  

### Exit criteria
- [ ] Shareable URL works on a second device  
- [ ] Health badge green in production  
- [ ] Backup kit ready  

---

## Phase 13 — Report, packaging, and presentation

### Objective
Finish official college submission and rehearse the class presentation.

### Suggested owner
Member D (assembly) + all members (sections)

### Sub-phases

#### 13.1 Report body
Write/finalize:
1. Introduction & objective  
2. Dataset description & variables  
3. Preprocessing (justified)  
4. EDA findings  
5. Modelling methodology  
6. Hyperparameter tuning  
7. Results & interpretation  
8. Usefulness & limitations  
9. Enhancement: Interactive Dashboard (short)  
10. Conclusion  
11. Member contributions  
12. References / appendix (figures + screenshots)  

#### 13.2 Contribution statements
- Each member writes what they owned; align with Team page.  

#### 13.3 Submission bundle
- Notebooks/scripts  
- Cleaned dataset  
- Report PDF/DOC  
- README with run + deploy URLs  
- (Optional) artifacts folder  

#### 13.4 Presentation script (8–10 min)
- 0:00–1:00 Hook + Home  
- 1:00–2:30 Data / Explore + `-200`  
- 2:30–5:00 Insights  
- 5:00–7:30 Predict live  
- 7:30–9:00 Limitations  
- 9:00–10:00 Team + Q&A  

#### 13.5 Viva prep notes
- Why time-series split?  
- What is leakage?  
- Why React if brief says Python?  
- When does the model fail?  

#### 13.6 Final checklist audit
- Walk [MASTER_EXECUTION_CHECKLIST.md](MASTER_EXECUTION_CHECKLIST.md) end-to-end.  
- No unchecked Must-Have items remain.  

### Artifacts produced
- Final report in `reports/`  
- Submission zip/folder  
- Presentation script + Q&A notes  

### Exit criteria
- [ ] Official deliverables complete  
- [ ] Live demo rehearsed once successfully  
- [ ] Master checklist fully ticked for Must-Haves  

---

## 5. Execution rules (team discipline)

1. **Order matters:** Phases 1→6 before rich UI; 7→8 before 10.  
2. **Single source of truth:** Dashboard numbers come only from cleaned data + `metrics.json` + model file.  
3. **No silent scope creep:** If it is not in Must-Have pages/endpoints, park it under Nice-to-Have after Phase 12.  
4. **Exit gates are real:** Do not mark a phase done without artifacts on disk.  
5. **Academic honesty:** Interpretations must match actual plots/metrics.  

---

## 6. Must-Have vs Nice-to-Have (final reminder)

### Must-Have
- Academic notebooks + cleaned data + report  
- API: health, meta, overview, timeseries, patterns, correlation, data, model info/predict/evaluation  
- UI: Home, Explore, Insights, Predict, Evaluation, Team  
- Deployed URL + backup  
- Limitations narrative  

### Nice-to-Have (only after Must-Haves)
- Theme toggle  
- Chart PNG export  
- CO severity badge  
- Demo video  

---

## 7. Definition of Done (whole project)

The project is complete when:

1. Next-hour `CO(GT)` pipeline runs end-to-end in Python notebooks.  
2. Cleaned dataset and model artifacts are exported and reloaded successfully.  
3. Report covers approach, findings, results, limitations, and contributions.  
4. AirWatch CO dashboard demonstrates Explore → Insights → Predict → Evaluation on a live URL.  
5. UI metrics match notebook metrics.  
6. Class presentation rehearsed with backup plan.  
7. [MASTER_EXECUTION_CHECKLIST.md](MASTER_EXECUTION_CHECKLIST.md) Must-Have items are all checked.

---

*Master plan for Group 3 — AirWatch CO. Use with MASTER_EXECUTION_CHECKLIST.md for day-to-day execution.*
