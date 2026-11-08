# AirWatch CO — Urban Air Quality & Pollution Intelligence

**MCA I Statistics Internal Assessment | Group 3 — Air Quality and Pollution**  
*Predictive modelling and statistical analysis of Carbon Monoxide concentrations using the UCI Air Quality dataset, featuring an interactive FastAPI + React monitoring dashboard.*

---

## 1. Project Overview & Research Objectives

* **Target Variable:** Predict next hour's reference Carbon Monoxide ground-truth concentration:
  $$\text{CO\_next}_t = \text{CO(GT)}_{t+1}$$
* **Dataset:** Official UCI Air Quality Dataset (`dataset/air+quality/AirQualityUCI.csv`) — 9,358 valid hourly observations recorded from March 2004 to April 2005 at road level within an Italian city.
* **Core Research Question:** *Given current weather conditions, semiconductor sensor responses, and pollutant concentrations, can we reliably forecast next-hour CO levels without temporal data leakage?*
* **Anti-Leakage Safeguard:** Enforces strict chronological partitioning (**Train: 70%**, **Validation: 15%**, **Test: 15%**) and time-series cross-validation (`TimeSeriesSplit`), preventing random train/test data leakage.

---

## 2. Final Model Benchmarks (Holdout Test Partition)

| Model Architecture | Test RMSE ($\text{mg/m}^3$) | Test MAE ($\text{mg/m}^3$) | Test $R^2$ | Gain vs Baseline | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Persistence Baseline** ($\hat{y}_{t+1} = y_t$) | 0.7739 | 0.4996 | 0.6556 | Reference | Naive Benchmark |
| **Standardized Linear Regression** | 0.7556 | 0.6035 | 0.6717 | +2.4% RMSE reduction | Interpretable |
| **Ridge Regression ($\alpha=10.0$)** | 0.7641 | 0.6156 | 0.6642 | +1.3% RMSE reduction | L2 Regularized |
| **Random Forest Regressor** | 0.5842 | 0.4032 | 0.8037 | +24.5% RMSE reduction | Tree Ensemble |
| **Tuned HistGradientBoostingRegressor** | **0.5378** | **0.3608** | **0.8337** | **+30.50% RMSE reduction** | **Selected Champion** |

* **Optimal Tuned Hyperparameters (5-Fold TimeSeriesSplit):**
  * `learning_rate`: `0.1` | `max_iter`: `100` | `max_depth`: `10` | `min_samples_leaf`: `20` | `l2_regularization`: `0.5`

---

## 3. Dual-Layer Architecture

```text
Business_Stats_AirQuality_Project/
├── dataset/air+quality/                # Original UCI CSV and XLSX files
├── data/cleaned/                       # Cleaned dataset (cleaned_air_quality.csv)
├── notebooks/                          # Academic core Jupyter notebooks
│   ├── 01_preprocessing.ipynb          # Parsing, -200 sentinel treatment, chronological split
│   ├── 02_eda.ipynb                    # Diurnal cycles, weekly patterns, correlation matrices
│   ├── 03_modelling.ipynb              # Baseline, Linear, Ridge, Tree ensembles
│   └── 04_tuning_evaluation.ipynb      # TimeSeriesSplit cross-validation, test evaluation
├── artifacts/                          # Serialized model & metadata for API
│   ├── model.joblib                    # Calibrated HistGradientBoosting model
│   ├── metrics.json                    # Single source of truth for benchmark metrics
│   └── feature_schema.json             # Feature definitions and calibration ranges
├── figures/                            # 10 High-resolution publication plots
├── backend/                            # FastAPI presentation layer
│   ├── app/
│   │   ├── main.py                     # Entry point & CORS configuration
│   │   ├── routers/                    # /health, /stats, /data, /model endpoints
│   │   ├── schemas/                    # Pydantic validation schemas
│   │   └── services/data_service.py    # Cached data and prediction service
│   ├── requirements.txt                # Backend dependencies
│   └── Procfile                        # Production process file
├── frontend/                           # React + Vite + TypeScript dashboard
│   ├── src/
│   │   ├── pages/                      # Home, Explore, Insights, Predict, Evaluation, Team
│   │   ├── components/                 # Navbar with live health badge, Footer
│   │   ├── api/client.ts               # Typed asynchronous API client
│   │   └── types/                      # TypeScript data interfaces
│   ├── tailwind.config.js              # Tailwind styling
│   └── vercel.json                     # SPA client-side routing
├── reports/                            # College submission bundle
│   ├── AIRWATCH_CO_FINAL_STATISTICS_REPORT.md    # Full 12-section formal report
│   ├── AIRWATCH_CO_FINAL_STATISTICS_REPORT.html  # Self-contained printable HTML report
│   └── VIVA_PRESENTATION_SCRIPT_AND_QA.md        # 8-10 min presentation script & Top 10 Q&A
├── start_project.bat                   # 1-Click launcher for Windows CMD
├── start_project.ps1                   # 1-Click launcher for Windows PowerShell
├── requirements.txt                    # Root Python dependencies
└── render.yaml                         # Render Infrastructure-as-Code blueprint
```

---

## 4. 1-Click Quickstart (Run Everything Locally)

### Option A: Automatic 1-Click Launchers
* **Windows Command Prompt (CMD) / Double-Click:**
  ```cmd
  start_project.bat
  ```
* **Windows PowerShell:**
  ```powershell
  .\start_project.ps1
  ```

---

### Option B: Manual Terminal Execution

#### 1. Start the FastAPI Backend
```bash
# Activate virtual environment
.\.venv\Scripts\Activate.ps1   # PowerShell
# or: d:\Business_Stats_AirQuality_Project\.venv\Scripts\activate.bat # CMD

# Launch API server
uvicorn backend.app.main:app --reload --port 8000
```
* **Interactive Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)  
* **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

#### 2. Start the React Frontend Dashboard
In a separate terminal window:
```bash
cd frontend
npm run dev
```
* **Interactive Dashboard:** [http://localhost:5173](http://localhost:5173)

---

## 5. REST API Endpoints Overview

| Category | Endpoint | Method | Description |
| :--- | :--- | :---: | :--- |
| **System** | `/health` | `GET` | Health verification (`{"status": "ok"}`) |
| **System** | `/meta` | `GET` | Project metadata, row counts, and date range |
| **Stats** | `/stats/overview` | `GET` | High-level summary KPIs and model benchmarks |
| **Stats** | `/stats/timeseries` | `GET` | Filterable timeseries with sampling strides |
| **Stats** | `/stats/hourly-pattern` | `GET` | Diurnal profile (0–23h) with mean, median, IQR |
| **Stats** | `/stats/weekday-pattern` | `GET` | Weekly distribution (Mon–Sun) |
| **Stats** | `/stats/correlation` | `GET` | 12x12 Pearson correlation matrix |
| **Stats** | `/stats/weather-scatter` | `GET` | Paired points for CO vs Temp, RH, and AH |
| **Explorer** | `/data` | `GET` | Paginated cleaned records with hour/date filters |
| **Explorer** | `/data/missingness` | `GET` | Before/after audit of `-200` sentinel codes |
| **Explorer** | `/data/download` | `GET` | Direct stream download of `cleaned_air_quality.csv` |
| **Model Lab** | `/model/info` | `GET` | Architecture specs and feature schema |
| **Model Lab** | `/model/sample-timestamps` | `GET` | Holdout test set timestamps for UI selector |
| **Model Lab** | `/model/predict` | `POST` | Live next-hour prediction (by timestamp or custom inputs) |
| **Model Lab** | `/model/evaluation` | `GET` | Model comparison table and actual vs predicted series |

---

## 6. College Assessment Verification & Test Suite

Run the automated backend test suite at any time:
```bash
python test_backend_api.py
```
*Outputs: 100% test pass across all endpoints and data schemas.*

Build the frontend production bundle:
```bash
cd frontend && npm run build
```
*Outputs: TypeScript compilation with 0 warnings/errors, optimized production bundle in `dist/`.*

---

## 7. Group 3 Team Members & Roles

* **Farhan Sayed (Data & Architecture Lead):** Cleaned dataset curation, `-200` sentinel handling, time-aware interpolation, chronological splits, FastAPI REST backend, React dashboard, and report compilation.
* **Member B (EDA & Analytics Lead):** Statistical moments, diurnal hourly cycle analysis, weekday vs weekend distributions, and correlation heatmap generation. *Replace with legal name before submission.*
* **Member C (Predictive Modelling Lead):** Formulation of next-hour target $CO_{next}$, baseline calibration, 5-fold `TimeSeriesSplit` cross-validation, and serialized model evaluation. *Replace with legal name before submission.*

## 8. Reports & Local Demo

* Report pack: `reports/AIRWATCH_CO_FINAL_STATISTICS_REPORT.md` / `.html` / `.pdf`
* Regenerate HTML: `python build_html_report.py`
* Regenerate PDF: `python export_report_pdf.py`
* Primary viva demo path: `.\start_project.ps1` → http://localhost:5173 + http://localhost:8000
* Cloud: `render.yaml` + `frontend/vercel.json` (deploy when credentials available)
