# MCA I Statistics Internal Assessment  
## Group 3 — Air Quality and Pollution  
### Project Idea, Scope & 21-Day Execution Plan

**Share with teammates first:** [TEAM_PROJECT_BRIEF.md](TEAM_PROJECT_BRIEF.md) · [PROJECT_ONE_PAGER.md](PROJECT_ONE_PAGER.md) · [SYSTEM_AND_DECISIONS.md](SYSTEM_AND_DECISIONS.md)  
**Build plans:** [MASTER_PROJECT_PLAN.md](MASTER_PROJECT_PLAN.md) · [MASTER_EXECUTION_CHECKLIST.md](MASTER_EXECUTION_CHECKLIST.md) · [ENHANCEMENT_WEB_DASHBOARD_PLAN.md](ENHANCEMENT_WEB_DASHBOARD_PLAN.md)

---

## 1. What This Project Is About (In One Paragraph)

This is a **statistics + predictive modelling** college project using the UCI **Air Quality** dataset (hourly readings from an urban monitoring station in Italy). You must investigate how air pollution changes over time and how it relates to weather and sensor readings, then build a model that predicts **next hour’s carbon monoxide concentration `CO(GT)`** using only information available up to the current hour. Finally, you must explain how useful those predictions are for air-quality monitoring and where they fail.

**Core research question:**  
*Given today’s hour’s weather, sensor and pollutant readings, can we reliably predict tomorrow’s / next hour’s CO level?*

---

## 2. Allotted Dataset — Exact Understanding

| Item | Detail |
|------|--------|
| **Name** | Air Quality Data Set (UCI / AirQualityUCI) |
| **Files in repo** | `dataset/air+quality/AirQualityUCI.csv`, `.xlsx` |
| **Format note** | CSV uses `;` as separator and `,` as decimal (European format) |
| **Frequency** | Hourly observations |
| **Approx. size** | ~9,358 valid hourly records (file may show ~9,472 lines including blanks) |
| **Period** | Roughly March 2004 – April 2005 |
| **Target to predict** | **`CO(GT)` at hour t+1** (next hour’s true CO concentration, mg/m³) |

### Variable dictionary (what each column means)

| Variable | Meaning | Role in project |
|----------|---------|-----------------|
| `Date`, `Time` | Timestamp of measurement | Time index; feature engineering (hour, day, month) |
| **`CO(GT)`** | True hourly avg. Carbon Monoxide (mg/m³) from reference analyzer | **Target (shifted to next hour)** |
| `PT08.S1(CO)` | Tin oxide sensor response (nominally CO) | Sensor feature |
| `NMHC(GT)` | True Non-Methane Hydrocarbons (µg/m³) | Pollutant feature (often heavily missing) |
| `C6H6(GT)` | True Benzene (µg/m³) | Pollutant feature |
| `PT08.S2(NMHC)` | Titania sensor (NMHC) | Sensor feature |
| `NOx(GT)` | True Nitrogen Oxides (ppb) | Pollutant feature |
| `PT08.S3(NOx)` | Tungsten oxide sensor (NOx) | Sensor feature |
| `NO2(GT)` | True Nitrogen Dioxide (µg/m³) | Pollutant feature |
| `PT08.S4(NO2)` | Tungsten oxide sensor (NO2) | Sensor feature |
| `PT08.S5(O3)` | Indium oxide sensor (O3) | Sensor feature |
| `T` | Temperature (°C) | Weather feature |
| `RH` | Relative Humidity (%) | Weather feature |
| `AH` | Absolute Humidity | Weather feature |

### Critical data quirk (must handle)

Missing / invalid sensor values are coded as **`-200`**, not as blank/NaN. If you ignore this, every statistic and model will be wrong.

---

## 3. Project Objective (What Success Looks Like)

1. **Describe** how pollution evolves over time (trends, daily/weekly seasonality, peaks).
2. **Relate** pollution to weather (`T`, `RH`, `AH`) and sensor responses.
3. **Build** a predictive model for **next-hour `CO(GT)`**.
4. **Tune** hyperparameters and evaluate honestly (time-aware validation).
5. **Interpret** usefulness and limitations for real air-quality monitoring.
6. **Submit** notebook/scripts + cleaned dataset + written report with member contributions.

**Official academic analysis must be in Python** (notebooks/scripts). The FastAPI + React dashboard is an optional presentation layer for demo/viva and does not replace the Python deliverables.

---

## 4. Exactly What Must Be Done (Required Tasks Mapped)

### Task 1 — Data Preprocessing
- Load CSV with correct separator/decimal.
- Parse `Date` + `Time` into a proper datetime index.
- Replace `-200` with NaN; quantify missingness per column.
- Decide imputation / dropping strategy (justify).
- Create the modelling target: `CO_next = CO(GT).shift(-1)` (next hour).
- Build features available **only up to current hour** (no leakage of future values).
- Export a **cleaned dataset** for submission.

### Task 2 — Exploratory Data Analysis (EDA)
- Univariate summaries for pollutants, sensors, weather.
- Time-series plots of `CO(GT)` (daily/weekly patterns, hour-of-day).
- Correlation / association with weather and sensors.
- Missingness patterns and outlier checks.
- Clear written interpretation linked to the objective.

### Task 3 — Predictive Model Building & Evaluation
- Define train/test split that respects time order (e.g. last 20–30% of time as test).
- Baseline model (e.g. predict next CO ≈ current CO, or simple mean).
- At least 2–3 models, e.g.:
  - Multiple Linear Regression (interpretable statistics baseline)
  - Random Forest / Gradient Boosting (non-linear)
  - Optional: Ridge/Lasso or a simple time-series lag model
- Metrics: **RMSE, MAE, R²** (and maybe MAPE if CO > 0).
- Residual analysis and error by hour-of-day / pollution level.

### Task 4 — Hyperparameter Tuning
- Use time-series cross-validation or a validation window (not random K-fold).
- Tune key params (e.g. tree depth, n_estimators, regularization strength).
- Report best params, CV score vs final test score (check overfitting).

### Justification requirement (mandatory for marks)
For every major choice (imputation, features, models, metrics, tuning), write **why** it fits this dataset and the next-hour CO prediction goal.

---

## 5. Recommended Technical Approach (Justified)

| Decision | Recommendation | Why |
|----------|-----------------|-----|
| Language | Python (`pandas`, `numpy`, `matplotlib`/`seaborn`, `scikit-learn`) | Required by brief; industry-standard for this work |
| Missing values | Treat `-200` as missing; drop columns with extreme missingness (often `NMHC(GT)`); impute others with time-aware methods (forward-fill short gaps / median by hour) | Preserves temporal structure; avoids fake “−200 ppm” |
| Target | `CO(GT)` at t+1 | Matches project objective exactly |
| Features | Current `CO(GT)`, sensors, weather, lags (1–3h), hour, dayofweek, maybe rolling 3h mean | Uses info “up to current hour” only |
| Split | Chronological train → validation → test | Prevents leaking future into past |
| Models | Linear Regression + Random Forest (or HistGradientBoosting) | Stats interpretability + stronger predictive power |
| Metrics | RMSE / MAE primary; R² secondary | Regression on continuous concentration |
| Tuning | `TimeSeriesSplit` + Grid/Random search | Honest for hourly sequential data |

---

## 6. Deliverables Checklist (College Submission)

| Deliverable | What to include |
|-------------|-----------------|
| **Python notebook / scripts** | Full pipeline: preprocess → EDA → model → tune → evaluate |
| **Cleaned dataset** | CSV/Parquet of cleaned, analysis-ready table |
| **Report (PDF/DOC)** | Approach, findings, model results, limitations, **each member’s contribution** |
| **Optional extras** | Saved model file, figures folder, `requirements.txt` |

### Suggested report structure
1. Introduction & objective  
2. Dataset description & variables  
3. Preprocessing (with justification)  
4. EDA findings (with charts)  
5. Modelling methodology  
6. Hyperparameter tuning  
7. Results & interpretation  
8. Usefulness & limitations for monitoring  
9. Conclusion  
10. Group member contributions  
11. References / appendix  

---

## 7. 21-Day Execution Plan

> Adjust start date to your college deadline. Below is a full sprint for **21 days**.

### Phase A — Setup & Understanding (Days 1–2)
| Day | Work |
|-----|------|
| 1 | Read brief + UCI variable docs; set up Python env; load raw data; confirm shapes/dtypes |
| 2 | Document `-200` missingness; draft feature/target definition; freeze project scope |

**Output:** Environment ready + short “data understanding” notes.

### Phase B — Preprocessing (Days 3–5)
| Day | Work |
|-----|------|
| 3 | Parse datetime; clean separators/decimals; replace `-200`; missingness report |
| 4 | Imputation / column drop decisions; create lag & calendar features; create `CO_next` |
| 5 | Sanity checks; export `cleaned_air_quality.csv`; write preprocessing section for report |

**Output:** Cleaned dataset + reproducible cleaning code.

### Phase C — EDA (Days 6–9)
| Day | Work |
|-----|------|
| 6 | Distributions, summary stats, outlier views |
| 7 | Time series of CO; hour-of-day / day-of-week patterns |
| 8 | Correlations: weather ↔ pollutants ↔ sensors |
| 9 | Write EDA interpretations; finalize key figures for report |

**Output:** EDA notebook section + figure set.

### Phase D — Modelling (Days 10–14)
| Day | Work |
|-----|------|
| 10 | Baseline model + metrics scaffolding |
| 11 | Linear / Ridge regression + coefficient interpretation |
| 12 | Tree-based model (RF / HGB) |
| 13 | Compare models on validation set; residual plots |
| 14 | Freeze candidate model for tuning |

**Output:** Working models + comparison table.

### Phase E — Tuning & Final Evaluation (Days 15–17)
| Day | Work |
|-----|------|
| 15 | TimeSeriesSplit + hyperparameter search |
| 16 | Final test evaluation; error analysis (when model fails) |
| 17 | Usefulness & limitations write-up (monitoring angle) |

**Output:** Tuned final model + honest performance story.

### Phase F — Report & Submission Pack (Days 18–21)
| Day | Work |
|-----|------|
| 18 | Draft full report (approach, findings, results) |
| 19 | Member contribution section; polish visuals; cite sources |
| 20 | Peer review notebook; fix bugs; regenerate cleaned data |
| 21 | Final packaging: notebook + cleaned data + report; submit |

**Output:** Complete submission bundle.

---

## 8. Team Roles (Suggested Split for Group 3)

| Role | Responsibilities | Best days |
|------|------------------|-----------|
| **Member A — Data Lead** | Preprocessing, cleaned dataset export, feature engineering | 1–5, 20 |
| **Member B — EDA Lead** | Charts, statistical summaries, EDA write-up | 6–9, 18 |
| **Member C — Modelling Lead** | Baselines, ML models, metrics, residual analysis | 10–14 |
| **Member D — Tuning & Report Lead** | Hyperparameter tuning, limitations, report assembly | 15–21 |

If you have 3 members, merge C+D or A+B. Everyone should still understand the full pipeline for viva/defense.

---

## 9. End-State Definition (Definition of Done)

The academic core is complete when **all** of the following are true:

- [x] Cleaned dataset exported and documented  
- [x] EDA answers: how pollution changes over time + link to weather/sensors  
- [x] Next-hour `CO(GT)` model trained without target leakage  
- [x] Hyperparameters tuned with time-aware validation  
- [x] Metrics reported on a held-out time period  
- [x] Usefulness & limitations written for air-quality monitoring  
- [x] Report member contribution names finalized (Group 3 of 6)  
- [x] Python notebooks/scripts run end-to-end  

Optional demo layer (AirWatch CO dashboard): FastAPI + React — see [TEAM_PROJECT_BRIEF.md](TEAM_PROJECT_BRIEF.md).

---

## 10. Where to Read Next

1. [TEAM_PROJECT_BRIEF.md](TEAM_PROJECT_BRIEF.md) — full teammate briefing (idea, decisions, status).  
2. [PROJECT_ONE_PAGER.md](PROJECT_ONE_PAGER.md) — short shareable summary.  
3. [SYSTEM_AND_DECISIONS.md](SYSTEM_AND_DECISIONS.md) — architecture, metrics, what exists on disk.  
4. [MASTER_PROJECT_PLAN.md](MASTER_PROJECT_PLAN.md) — phased execution detail.  
5. [MASTER_EXECUTION_CHECKLIST.md](MASTER_EXECUTION_CHECKLIST.md) — checkbox tracker.

---

*Document for MCA I Statistics Internal Assessment — Group 3 (Air Quality and Pollution). Academic analysis: Python; presentation layer: FastAPI + React (AirWatch CO).*
