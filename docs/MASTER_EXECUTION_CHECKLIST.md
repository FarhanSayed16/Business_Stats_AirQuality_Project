# Master Execution Checklist — AirWatch CO  
## Group 3 | MCA I Statistics Internal Assessment

Use this as the **daily checkpoint**. Tick items as they are finished.  
Full detail lives in [MASTER_PROJECT_PLAN.md](MASTER_PROJECT_PLAN.md).  
Related: [PROJECT_IDEA_AND_EXECUTION_PLAN.md](PROJECT_IDEA_AND_EXECUTION_PLAN.md) · [ENHANCEMENT_WEB_DASHBOARD_PLAN.md](ENHANCEMENT_WEB_DASHBOARD_PLAN.md)

**Rule:** Finish phases in order. Do not start Phase 9–10 feature UI until Phase 6 artifacts exist.

---

## Phase 1 — Project kickoff and environment

### 1.1 Brief and scope lock
- [x] College brief re-read and understood
- [x] Dataset path confirmed: `dataset/air+quality/AirQualityUCI.csv`
- [x] Stack locked: Python notebooks + FastAPI + React (AirWatch CO)
- [x] Member roles assigned (Data / EDA / Modelling / Product)

### 1.2 Repository folder skeleton
- [x] `notebooks/` created
- [x] `data/cleaned/` created
- [x] `artifacts/` created
- [x] `figures/` created
- [x] `reports/` created
- [x] `backend/` created
- [x] `frontend/` created
- [x] `.gitignore` covers `.venv/`, `node_modules/`, `__pycache__/`, `.env`

### 1.3 Python environment
- [x] Virtual environment created
- [x] pandas, numpy, matplotlib, seaborn, scikit-learn, joblib, openpyxl, jupyter installed
- [x] Root `requirements.txt` written

### 1.4 Node toolchain check
- [x] Node.js LTS available
- [x] npm available
- [x] Versions noted in README

### 1.5 README stub
- [x] Title + Group 3 + objective one-liner added
- [x] Venv / notebook run instructions added
- [x] Placeholder for API and frontend commands added

### 1.6 Smoke load raw data
- [x] CSV loads with `sep=';'` and `decimal=','`
- [x] Shape and columns printed successfully

### Phase 1 exit
- [x] Repo structure documented
- [x] Teammate can activate venv and import pandas
- [x] Raw CSV loads without parse errors

---

## Phase 2 — Data understanding

### 2.1 Variable dictionary
- [x] Every column documented (meaning, unit, role)

### 2.2 Format and quality quirks
- [x] `;` separator and `,` decimal confirmed
- [x] `-200` invalid-value coding documented
- [x] Trailing empty columns noted if present

### 2.3 Missingness profile (raw)
- [x] Missing % computed per column after treating `-200` as missing
- [x] Extreme-missing columns flagged (e.g. `NMHC(GT)`)

### 2.4 Target freeze
- [x] Target defined as `CO_next = CO(GT).shift(-1)`
- [x] “Info up to current hour only” rule written

### 2.5 Feature policy freeze
- [x] Allowed features listed (current + lags + calendar)
- [x] Forbidden future leakage explicitly listed

### 2.6 Data-understanding write-up
- [x] Short notes ready for report Section 2

### Phase 2 exit
- [x] Team agrees on `CO_next`
- [x] `-200` rule documented
- [x] Leakage rules shared with team

---

## Phase 3 — Data preprocessing

### 3.1 Parsing and typing
- [x] Datetime index created from Date + Time
- [x] Numerics coerced correctly
- [x] Sorted by datetime; empty rows dropped

### 3.2 Invalid value handling
- [x] All `-200` replaced with NaN
- [x] Before/after missingness report generated

### 3.3 Column decisions
- [x] Drop/keep decisions made with written justification
- [x] Usable sensors, weather, pollutants retained

### 3.4 Imputation strategy
- [x] Time-aware imputation/drop approach chosen
- [x] Justification written in notebook

### 3.5 Feature engineering
- [x] Calendar features created (`hour`, `dayofweek`, `month`)
- [x] Lag features created (CO lags 1–3 at minimum)
- [x] Optional rolling features created or explicitly skipped
- [x] `CO_next` created; trailing NaN target rows dropped

### 3.6 Chronological split masks
- [x] Train/validation/test time boundaries defined
- [x] Split timestamps recorded for report + API

### 3.7 Export cleaned data
- [x] `data/cleaned/cleaned_air_quality.csv` exported
- [x] Schema documented

### 3.8 Preprocessing notebook polish
- [x] `notebooks/01_preprocessing.ipynb` submission-ready
- [x] Report preprocessing bullets drafted

### Phase 3 exit
- [x] Cleaned CSV reloads cleanly
- [x] No `-200` remain in cleaned numerics
- [x] `CO_next` and lags present
- [x] Split strategy documented

---

## Phase 4 — Exploratory data analysis

### 4.1 Univariate summaries
- [x] Distributions for CO, key pollutants, sensors, weather summarized
- [x] Outliers/skew noted

### 4.2 Time behaviour
- [x] CO full-period timeseries plotted
- [x] CO by hour-of-day plotted
- [x] CO by day-of-week plotted
- [x] Pattern interpretation written

### 4.3 Weather relationships
- [x] CO vs T / RH / AH explored
- [x] Short correlation interpretation written

### 4.4 Sensor and pollutant associations
- [x] Correlation heatmap created
- [x] Strongest CO correlates noted

### 4.5 Data-quality visuals
- [x] Missingness before vs after chart created
- [x] Optional boxplots created or skipped consciously

### 4.6 Insight cards copy
- [x] 4–8 dashboard insight bullets written (evidence-based only)

### 4.7 Export figures
- [x] Figures saved under `figures/`
- [x] `notebooks/02_eda.ipynb` complete

### Phase 4 exit
- [x] Time, weather, correlation analyses complete
- [x] Figures ready for report
- [x] Insight bullets team-reviewed

---

## Phase 5 — Baseline and predictive modelling

### 5.1 Modelling frame
- [x] Feature columns selected per policy
- [x] Chronological train/val/test respected

### 5.2 Baseline model
- [x] Naive baseline implemented
- [x] Baseline RMSE/MAE/R² recorded

### 5.3 Interpretable model
- [x] Linear and/or Ridge fitted
- [x] Coefficients inspected for report story

### 5.4 Non-linear model
- [x] RandomForest or HistGradientBoosting fitted

### 5.5 Evaluation toolkit
- [x] Shared RMSE/MAE/R² helpers exist
- [x] Actual-vs-predicted plot created
- [x] Residual plot created

### 5.6 Model comparison table
- [x] Baseline vs Linear/Ridge vs Tree metrics tabulated
- [x] Tuning candidate selected

### 5.7 Modelling notebook
- [x] `notebooks/03_modelling.ipynb` complete with justifications

### Phase 5 exit
- [x] Baseline + ≥2 models trained
- [x] Validation metrics tabulated
- [x] Candidate model chosen for Phase 6

---

## Phase 6 — Hyperparameter tuning and final evaluation

### 6.1 Tuning setup
- [x] `TimeSeriesSplit` configured
- [x] Search space defined

### 6.2 Search and selection
- [x] Grid or Randomized search run
- [x] Best params + CV score recorded

### 6.3 Final holdout evaluation
- [x] Best model scored on untouched test set
- [x] Test metrics compared to baseline

### 6.4 Error / failure analysis
- [x] High-error conditions identified
- [x] Residual figures saved for report/UI

### 6.5 Artifact export
- [x] `artifacts/model.joblib` saved
- [x] `artifacts/metrics.json` saved
- [x] `artifacts/feature_schema.json` saved

### 6.6 Usefulness and limitations draft
- [x] Monitoring usefulness drafted
- [x] Limitations drafted

### 6.7 Tuning notebook
- [x] `notebooks/04_tuning_evaluation.ipynb` complete
- [x] Reloaded model reproduces test metrics

### Phase 6 exit
- [x] Best hyperparameters documented
- [x] Test metrics finalized
- [x] All three artifact files exist
- [x] Limitations draft approved
- [x] **GATE PASSED — UI feature work may begin**

---

## Phase 7 — Backend API foundation (FastAPI)

### 7.1 Scaffold backend
- [ ] `backend/app/main.py` created
- [ ] `routers/`, `services/`, `schemas/` created
- [ ] `backend/requirements.txt` created

### 7.2 Startup loading
- [ ] Cleaned CSV loaded at startup
- [ ] `metrics.json` loaded at startup
- [ ] `feature_schema.json` loaded at startup
- [ ] `model.joblib` loaded at startup
- [ ] Clear failure if artifacts missing

### 7.3 CORS and config
- [ ] CORS allows `http://localhost:5173`
- [ ] Artifact paths configurable

### 7.4 Core routes
- [ ] `GET /health` works
- [ ] `GET /meta` works

### 7.5 Pydantic schemas
- [ ] Overview / filter / predict / evaluation schemas defined

### 7.6 Local run docs
- [ ] Uvicorn run command documented

### Phase 7 exit
- [ ] Uvicorn starts with artifacts present
- [ ] `/health` returns 200
- [ ] `/meta` reflects cleaned data summary

---

## Phase 8 — Backend domain endpoints

### 8.1 Overview stats
- [ ] `GET /stats/overview` returns KPIs + best model metrics

### 8.2 Timeseries and patterns
- [ ] `GET /stats/timeseries` works (with date filters)
- [ ] `GET /stats/hourly-pattern` works
- [ ] `GET /stats/weekday-pattern` works

### 8.3 Relationships
- [ ] `GET /stats/correlation` works
- [ ] `GET /stats/weather-scatter` works

### 8.4 Data explorer
- [ ] `GET /data` supports filters/pagination
- [ ] Cleaned CSV download available
- [ ] Missingness summary payload available

### 8.5 Model endpoints
- [ ] `GET /model/info` works
- [ ] `GET /model/sample-timestamps` works
- [ ] `POST /model/predict` works (timestamp and/or features)
- [ ] `GET /model/evaluation` works

### 8.6 Parity checks
- [ ] Overview metrics match `metrics.json`
- [ ] One known timestamp prediction matches notebook

### Phase 8 exit
- [ ] All Must-Have endpoints implemented
- [ ] JSON numbers match notebook/artifacts
- [ ] Historical predict works on test timestamps

---

## Phase 9 — Frontend foundation (React)

### 9.1 Vite app scaffold
- [ ] `frontend/` created with Vite + React + TypeScript
- [ ] Tailwind installed
- [ ] React Router installed
- [ ] Recharts installed

### 9.2 Design tokens
- [ ] Light theme + slate/teal accent defined
- [ ] Projector-friendly typography baseline set

### 9.3 Layout and navigation
- [ ] App shell with nav for all 6 pages
- [ ] Footer with Group 3 label

### 9.4 API client
- [ ] `VITE_API_URL` wired
- [ ] Shared fetch helpers created
- [ ] Loading and error components created

### 9.5 Page shells
- [ ] Home route shell
- [ ] Explore route shell
- [ ] Insights route shell
- [ ] Predict route shell
- [ ] Evaluation route shell
- [ ] Team route shell

### 9.6 Health badge
- [ ] API online/offline badge working

### Phase 9 exit
- [ ] `npm run dev` works
- [ ] All routes reachable
- [ ] Health badge reflects backend

---

## Phase 10 — Frontend feature pages

### 10.1 Home
- [ ] Title + objective + Group 3 shown
- [ ] KPI cards wired to `/stats/overview`
- [ ] Best model metrics shown
- [ ] CTAs to Explore / Insights / Predict
- [ ] How-to-use strip added

### 10.2 Explore
- [ ] Filterable table (date, hour)
- [ ] Variable dictionary tooltips
- [ ] Missingness / `-200` explanation
- [ ] Download cleaned CSV control

### 10.3 Insights
- [ ] CO timeseries chart
- [ ] Hour-of-day chart
- [ ] Weekday chart
- [ ] Weather vs CO scatter
- [ ] Correlation heatmap
- [ ] Insight cards rendered

### 10.4 Predict (Model Lab)
- [ ] Historical timestamp picker
- [ ] Predict returns next-hour CO
- [ ] Actual vs predicted shown when available
- [ ] Model info side panel shown
- [ ] Optional test-set actual-vs-predicted chart

### 10.5 Evaluation
- [ ] Metrics comparison table
- [ ] Residual / error commentary
- [ ] Usefulness + limitations content

### 10.6 Team
- [ ] Names, roles, contributions listed
- [ ] Tech stack badges shown

### 10.7 Local full demo path
- [ ] Home → Explore → Insights → Predict → Evaluation runs clean

### Phase 10 exit
- [ ] All Must-Have UI features working locally
- [ ] Predict-vs-actual demo reliable
- [ ] Demo story needs no notebook

---

## Phase 11 — Integration hardening

### 11.1 Metric parity audit
- [ ] Home KPIs match `metrics.json`
- [ ] Evaluation table matches notebooks/artifacts

### 11.2 Empty and error states
- [ ] API-down state handled
- [ ] Empty filter state handled
- [ ] Predict failure state handled

### 11.3 Presentation UX
- [ ] Fonts/labels readable on projector
- [ ] Insights sections keep one chart focus each

### 11.4 Performance
- [ ] Heavy timeseries downsampled/aggregated if needed
- [ ] Insights loads in acceptable time

### 11.5 CORS for production
- [ ] Allowed origins list prepared (localhost + Vercel)

### 11.6 Dry run
- [ ] 15-minute unbroken local demo completed

### Phase 11 exit
- [ ] UI metrics == artifacts
- [ ] Dry-run passed
- [ ] Error states verified

---

## Phase 12 — Deployment

### 12.1 Backend on Render
- [ ] FastAPI deployed
- [ ] Cleaned data + artifacts accessible to service
- [ ] Public `/health` OK

### 12.2 Frontend on Vercel
- [ ] React app deployed
- [ ] `VITE_API_URL` set to Render URL
- [ ] CORS allows Vercel domain

### 12.3 Production smoke test
- [ ] Home KPIs load
- [ ] Charts load
- [ ] Predict works for ≥5 sample timestamps
- [ ] Evaluation metrics visible

### 12.4 Backup kit
- [ ] Localhost instructions in README
- [ ] Screenshot appendix prepared
- [ ] Optional demo video recorded or explicitly skipped

### 12.5 URL documentation
- [ ] Production URLs in README
- [ ] Production URLs on Team page

### Phase 12 exit
- [ ] URL works on a second device
- [ ] Production health badge green
- [ ] Backup kit ready

---

## Phase 13 — Report, packaging, and presentation

### 13.1 Report body
- [ ] Introduction & objective
- [ ] Dataset description & variables
- [ ] Preprocessing (justified)
- [ ] EDA findings
- [ ] Modelling methodology
- [ ] Hyperparameter tuning
- [ ] Results & interpretation
- [ ] Usefulness & limitations
- [ ] Enhancement: Interactive Dashboard section
- [ ] Conclusion
- [ ] Member contributions
- [ ] References / appendix (figures + screenshots)

### 13.2 Contribution statements
- [ ] Each member contribution written
- [ ] Team page matches report

### 13.3 Submission bundle
- [ ] Notebooks/scripts included
- [ ] Cleaned dataset included
- [ ] Report PDF/DOC in `reports/`
- [ ] README includes run + deploy URLs
- [ ] Optional artifacts included if required by team

### 13.4 Presentation script (8–10 min)
- [ ] Hook + Home segment prepared
- [ ] Explore / `-200` segment prepared
- [ ] Insights segment prepared
- [ ] Live Predict segment prepared
- [ ] Limitations segment prepared
- [ ] Team + Q&A close prepared

### 13.5 Viva prep notes
- [ ] Why time-series split?
- [ ] What is leakage?
- [ ] Why React if brief says Python-only analysis?
- [ ] When does the model fail?

### 13.6 Final checklist audit
- [ ] This entire checklist re-audited
- [ ] No Must-Have items left unchecked

### Phase 13 exit
- [ ] Official deliverables complete
- [ ] Live demo rehearsed once successfully
- [ ] Project Definition of Done satisfied

---

## Nice-to-Have (only after all Must-Haves)

- [ ] Dark/light theme toggle
- [ ] Chart PNG export
- [ ] CO severity badge (with justified thresholds)
- [ ] 2-minute backup demo video

---

## Final Definition of Done

- [ ] Python notebooks run preprocess → EDA → model → tune end-to-end
- [ ] Cleaned dataset + model artifacts export and reload correctly
- [ ] Report complete with contributions and limitations
- [ ] AirWatch CO live demo: Explore → Insights → Predict → Evaluation
- [ ] UI metrics match notebook metrics
- [ ] Class presentation rehearsed with backup plan
- [ ] All Must-Have checklist items above are checked

---

*Tick through this file while executing [MASTER_PROJECT_PLAN.md](MASTER_PROJECT_PLAN.md).*
