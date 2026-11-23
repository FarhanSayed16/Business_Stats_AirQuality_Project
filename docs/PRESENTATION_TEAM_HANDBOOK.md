# AirWatch CO — Presentation Team Handbook

**Use this before Wednesday.** Read once end-to-end, then open the dashboard and match each section.

| Item | Detail |
|------|--------|
| Course | MCA I Statistics Internal Assessment |
| Group | Group 3 — Air Quality and Pollution |
| Product | **AirWatch CO** (Urban Atmospheric Intelligence) |
| **Live dashboard (Vercel)** | https://business-stats-air-quality-project.vercel.app |
| **Live API (Render)** | https://business-stats-airquality-project.onrender.com |
| Live health check | https://business-stats-airquality-project.onrender.com/health |
| Local UI (backup) | http://localhost:5173 |
| Local API (backup) | http://localhost:8000 |
| Run commands | [`RUN_LOCALLY.md`](RUN_LOCALLY.md) |
| Dashboard guide | [`DASHBOARD_WALKTHROUGH.md`](DASHBOARD_WALKTHROUGH.md) |
| Speaking script | [`PRESENTATION_SCRIPT_6_MEMBERS.md`](PRESENTATION_SCRIPT_6_MEMBERS.md) |

**Wednesday primary demo:** use the **live Vercel dashboard** (API is already live on Render). Keep local stack as backup if the network fails. First Render hit after idle can take ~30–60 seconds (free-tier wake-up).

---

## 1. One-line project idea

We predict **next-hour Carbon Monoxide** (`CO_next`) from an Italian urban roadside station using only information available **up to the current hour** — weather, sensors, and pollutants — with **no future leakage**.

**Research question:**  
*Given current hour’s weather, sensors, and pollutant readings, can we reliably forecast next hour’s true CO?*

---

## 2. Problem approach (how we thought)

1. **Understand data** — UCI Air Quality hourly series (~1 year).  
2. **Clean honestly** — treat hardware errors correctly (`-200`).  
3. **Explore patterns** — diurnal / weekly / weather / correlations.  
4. **Define target** — `CO_next = CO(GT)` shifted by +1 hour.  
5. **Split by time** — 70% train / 15% val / 15% test (chronological).  
6. **Model ladder** — baseline → linear → ridge → trees → tuned champion.  
7. **Evaluate honestly** — RMSE, MAE, R² + failure modes.  
8. **Demo** — FastAPI + React dashboard for viva.

---

## 3. Dataset (what we used)

| Fact | Value |
|------|--------|
| Source | UCI Air Quality (`dataset/air+quality/AirQualityUCI.csv`) |
| Place / period | Italian urban road level · ~Mar 2004–Apr 2005 |
| Frequency | Hourly |
| After cleaning | **9,353** modelling rows |
| Target | `CO(GT)` next hour (`CO_next`) |
| Key features | Current CO, other pollutants, PT08 sensors, T / RH / AH, hour/month cycles, lags |

### Critical quirk everyone must know
Missing / invalid sensor values are coded as **`-200`**, not blank.  
If ignored, every mean, correlation, and model is wrong.

---

## 4. Data cleaning (exact steps)

1. Parse European CSV (`;` separator, `,` decimals).  
2. Build DateTime; drop blank trailing rows / empty columns.  
3. Replace **`-200` → NaN**.  
4. Drop **`NMHC(GT)`** (~**90%** missing) — do not invent 90% of a column.  
5. Time-aware linear interpolation for short gaps on remaining continuous series.  
6. Create **`CO_next`**; drop incomplete last row.  
7. Chronological **70 / 15 / 15** split masks.

**Cleaned file:** `data/cleaned/cleaned_air_quality.csv`  
**Missingness audit:** Explore page + Statistics → Data cleaning chart.

---

## 5. Outliers (classical Business Statistics)

| Term | Meaning |
|------|---------|
| IQR | Q3 − Q1 |
| Lower / left fence | Q1 − 1.5 × IQR |
| Upper / right fence | Q3 + 1.5 × IQR |
| Left / lower outliers | Values **below** lower fence |
| Right / upper outliers | Values **above** upper fence |

**Policy for viva:**  
- `-200` = invalid → cleaned as missing.  
- IQR extremes on cleaned CO are often **real pollution peaks** → we **flag & discuss**, we do **not** mass-delete them.

**Where to show:** Dashboard → **Statistics** → section 3.

For cleaned `CO(GT)` roughly: IQR ≈ 1.8, upper fence ≈ 5.5, **~256 right outliers**, ~0 left outliers.

---

## 6. Distributions & probability language

- Moments: mean, std, **skewness**, kurtosis.  
- CO is **right-skewed** → Normal(μ,σ) “bell” overlay is a **teaching comparison**, not a claim CO is Gaussian.  
- Empirical probabilities: P(CO &lt; 2), P(2–4), P(≥ 4), plus P(≥ 5), P(≥ 6); percentiles P10…P95; empirical CDF.  
- Project tiers (&lt;2 / 2–4 / ≥4) are **analytical bins**, not certified AQI.  
- **Bayesian regression is out of scope** — do not claim it.

**Where:** Statistics → sections 4–5.

---

## 7. Models & methods used

| Method | Role |
|--------|------|
| Persistence baseline | `ŷ = current CO` (naive but strong) |
| Linear Regression | Interpretable linear benchmark |
| Ridge (α=10) | L2-regularized linear |
| Random Forest | Non-linear tree ensemble |
| **Tuned HistGradientBoosting** | **Champion** (TimeSeriesSplit-tuned) |

### Holdout test results (memorize champion)

| Model | RMSE | MAE | R² |
|-------|------|-----|-----|
| Persistence | 0.7739 | 0.4996 | 0.6556 |
| Linear | 0.7556 | 0.6035 | 0.6717 |
| Ridge | 0.7641 | 0.6156 | 0.6642 |
| Random Forest | 0.5842 | 0.4032 | 0.8037 |
| **HGB (champion)** | **0.5378** | **0.3608** | **0.8337** |

≈ **30.5%** RMSE improvement vs baseline.

**Validation rule:** chronological split + `TimeSeriesSplit` — **never** random K-fold on this series (leakage).

**Artifacts:** `artifacts/model.joblib`, `metrics.json`, `feature_schema.json`.

---

## 8. Graphs used in the system (what each means)

| Location | Graph / view | What it shows |
|----------|--------------|---------------|
| Home | CO gauge + KPI pods | Mean CO / weather / sensor snapshot |
| Explore | Table + missingness cards | Cleaned rows; −200 audit |
| Insights | Hourly mean/IQR band | Bimodal rush-hour pattern |
| Insights | Weekday bars / box view | Sunday lull |
| Insights | Weather scatter | CO vs T / RH / AH |
| Insights | Correlation heatmap | Co-emission / sensor links |
| Insights | Timeseries | CO over time |
| Statistics | Missingness bars | Raw vs cleaned missing % |
| Statistics | IQR fence bars + counts | Left/right outliers |
| Statistics | Histogram + normal line | Distribution vs bell curve |
| Statistics | Percentiles + CDF | Probability language |
| Statistics | Model RMSE bars | Method comparison |
| Predict | Gauge / error cards | Live next-hour forecast |
| Evaluation | Model table + importance | Why HGB wins; drivers |
| Evaluation | Actual vs predicted | Holdout behavior |
| Evaluation | Error by pollution tier | Fails more on extreme peaks |

---

## 9. Tech stack

| Layer | Tools |
|-------|--------|
| Academic | Python, pandas, scikit-learn, Jupyter notebooks 01–04 |
| API | FastAPI + Uvicorn |
| UI | React + Vite + TypeScript + Tailwind + Recharts |
| Deploy (optional) | Render (API) + Vercel (frontend) |

**Architecture:** Notebooks → cleaned CSV + artifacts → FastAPI → React dashboard.

---

## 10. Academic deliverables vs demo

| Must submit / show | Path |
|--------------------|------|
| Notebooks | `notebooks/01`–`04` |
| Cleaned data | `data/cleaned/` |
| Report | `reports/AIRWATCH_CO_FINAL_STATISTICS_REPORT.*` |
| Dashboard demo | local or cloud URL |
| Usefulness & limits | report + Evaluation page |

---

## 11. Limitations (say these honestly)

1. Extreme peaks underestimated (tree models don’t extrapolate well).  
2. Single Italian station — not plug-and-play for another city.  
3. Horizon is **t+1 hour only**.  
4. No wind / traffic counts / event shocks in features.

---

## 12. Top viva Q&A (short)

1. **Why drop NMHC?** ~90% missing — imputation would invent data.  
2. **Why not random split?** Time series autocorrelation → leakage.  
3. **What is leakage?** Using future info to predict the future.  
4. **Why HGB?** Best holdout RMSE/MAE/R² after TimeSeriesSplit tuning.  
5. **Outliers deleted?** No — flagged; peaks can be real. `-200` cleaned separately.  
6. **Is CO normal?** Skewed; bell overlay is comparative only.  
7. **Why React if brief says Python?** Python is academic core; React is presentation layer.  
8. **When does model fail?** Extreme CO episodes; MAE rises a lot.

---

## 13. Suggested prep checklist (Wednesday)

- [ ] Everyone runs local stack once ([`RUN_LOCALLY.md`](RUN_LOCALLY.md))  
- [ ] Everyone clicks every dashboard tab with [`DASHBOARD_WALKTHROUGH.md`](DASHBOARD_WALKTHROUGH.md)  
- [ ] Assign Member 1–6 parts from [`PRESENTATION_SCRIPT_6_MEMBERS.md`](PRESENTATION_SCRIPT_6_MEMBERS.md)  
- [ ] Rehearse full run once (8–12 minutes)  
- [ ] One person owns laptop + backup phone hotspot  

---

*Share this file first. Then dashboard walkthrough. Then speaking script.*
