# AirWatch CO  
## Final Executive Summary

**MCA I Statistics Internal Assessment**  
**Group 3 — Air Quality and Pollution**  
**Project title:** AirWatch CO — Predictive Modelling and Statistical Analysis of Urban Carbon Monoxide Concentrations  

| | |
|--|--|
| **Group members** | Farhan Sayed · Salman Khan · Sahil Tambe · Shruti Pawar · Aayesha Kaliwala · Kashish Maurya |
| **Dataset** | UCI Machine Learning Repository — Air Quality Data Set (CNR-ISAC, Italy) |
| **Interactive demonstration** | https://business-stats-air-quality-project.vercel.app |
| **Prediction API** | https://business-stats-airquality-project.onrender.com |
| **Full technical report** | `reports/AIRWATCH_CO_FINAL_STATISTICS_REPORT.md` / `.html` / `.pdf` |

---

## 1. Purpose of the project

Urban roadside Carbon Monoxide (\(CO\)) is a toxic combustion pollutant that varies sharply with traffic and meteorology. Municipal monitoring systems record concentrations hourly, but short-horizon foresight can support traffic management and public-health advisories.

**AirWatch CO** delivers an end-to-end academic statistics project that:

1. Cleans and documents the official UCI Air Quality hourly dataset.  
2. Explores pollution patterns with classical Business Statistics and exploratory data analysis.  
3. Builds and fairly compares predictive models for **next-hour** reference \(CO\).  
4. Reports usefulness and limitations honestly.  
5. Demonstrates the complete pipeline through a live FastAPI + React dashboard.

The official academic analysis is implemented in **Python**. The web dashboard is a presentation layer for demonstration and viva; it does not replace the notebook-based statistical core.

---

## 2. Research question and prediction target

**Research question**  
*Using only weather readings, metal-oxide sensor responses, and pollutant concentrations available up to the current hour, can next-hour true Carbon Monoxide \(\mathrm{CO(GT)}\) be predicted without temporal data leakage?*

**Target variable**

\[
\mathrm{CO\_next}_t = \mathrm{CO(GT)}_{t+1}
\]

Only information known at time \(t\) (and earlier) enters the feature set. Future values are excluded by design.

---

## 3. Dataset

| Attribute | Detail |
|-----------|--------|
| Source | UCI Air Quality Data Set |
| Setting | Road-level station in an Italian urban area |
| Frequency | Hourly |
| Calendar span | Approximately March 2004 – April 2005 |
| Modelling sample after cleaning | **9,353** hourly records |
| Predictors (examples) | Current \(\mathrm{CO(GT)}\), other pollutants, PT08 sensor responses, temperature (\(T\)), relative humidity (\(RH\)), absolute humidity (\(AH\)), calendar and lag features |

---

## 4. Methodology (how the work was done)

### 4.1 Data cleaning

| Issue | Treatment |
|-------|-----------|
| Hardware invalid codes stored as **−200** | Replaced with missing values (NaN); never treated as real concentrations |
| `NMHC(GT)` ≈ 90% missing | Column dropped (imputation would fabricate most of the series) |
| Short gaps in continuous sensors / weather | Time-aware linear interpolation |
| Modelling target | Constructed as next-hour \(\mathrm{CO(GT)}\) |

### 4.2 Validation design (anti-leakage)

Air-quality series are strongly autocorrelated. Therefore the project uses:

- Chronological partition: **70% training / 15% validation / 15% holdout test**  
- Hyperparameter search with **`TimeSeriesSplit`**

Random \(K\)-fold cross-validation was rejected because it mixes future observations into training and produces inflated, invalid performance estimates.

### 4.3 Classical Business Statistics and EDA

In addition to modelling, the project documents:

- Summary moments (mean, dispersion, skewness)  
- **IQR outlier fences** (lower = \(Q_1 - 1.5\times\mathrm{IQR}\); upper = \(Q_3 + 1.5\times\mathrm{IQR}\)); left/lower versus right/upper outliers, with the policy that extreme \(CO\) peaks are often genuine events and are flagged rather than mass-deleted  
- Histogram comparison against a Normal(\(\mu,\sigma\)) reference curve  
- Empirical probabilities / percentiles for analytical concentration tiers  
- Diurnal (rush-hour) and weekly (Sunday lull) patterns  
- Weather coupling and multi-pollutant / sensor correlations  

### 4.4 Predictive models compared

| Model | Role in the study |
|-------|-------------------|
| Persistence baseline | \(\hat{y}_{t+1} = \mathrm{CO(GT)}_t\) — strong naive reference |
| Linear Regression | Interpretable linear benchmark |
| Ridge Regression | L2-regularised linear benchmark |
| Random Forest | Non-linear tree ensemble |
| **Tuned HistGradientBoosting** | Sequentially boosted trees; **selected champion** after time-series tuning |

### 4.5 Performance metrics

| Metric | Interpretation |
|--------|----------------|
| RMSE | Root Mean Squared Error — lower is better |
| MAE | Mean Absolute Error — lower is better |
| R² | Coefficient of determination — higher is better |

---

## 5. Principal results

### 5.1 Holdout test performance

| Model | Test RMSE (mg/m³) | Test MAE (mg/m³) | Test R² |
|-------|-------------------:|------------------:|--------:|
| Persistence baseline | 0.7739 | 0.4996 | 0.6556 |
| Linear Regression | 0.7556 | 0.6035 | 0.6717 |
| Ridge Regression | 0.7641 | 0.6156 | 0.6642 |
| Random Forest | 0.5842 | 0.4032 | 0.8037 |
| **Tuned HistGradientBoosting** | **0.5378** | **0.3608** | **0.8337** |

The champion model reduces RMSE by approximately **30.5%** relative to the persistence baseline on the chronological holdout set.

### 5.2 Why the selected model outperforms the others (summary)

- **Persistence** is competitive because \(CO\) is sticky hour-to-hour, but it ignores weather, sensors, and calendar structure.  
- **Linear / Ridge** models are transparent but cannot capture strong non-linear rush-hour and interaction effects.  
- **Random Forest** improves markedly by allowing non-linear splits, yet sequential gradient boosting with time-aware tuning achieved still lower holdout error.  
- **Tuned HistGradientBoosting** therefore provides the best balance of accuracy and validated generalisation under leakage-safe evaluation.

### 5.3 Empirical atmospheric patterns

- **Bimodal diurnal profile:** elevated concentrations around morning and evening commute periods.  
- **Weekly structure:** lower activity on Sunday relative to weekdays, consistent with traffic-driven emissions.  
- **Co-emission / sensor links:** \(CO\) associates strongly with related pollutants and key solid-state sensors used as predictors.

### 5.4 Error behaviour

Predictive accuracy is strongest in low-to-moderate concentration regimes. Error increases during rare high-pollution spikes, which is expected for tree-based regressors that do not extrapolate far beyond patterns observed in training.

---

## 6. Deliverables submitted with the project

| Deliverable | Description |
|-------------|-------------|
| Python notebooks (`01`–`04`) | Preprocessing, EDA, modelling, tuning and evaluation |
| Cleaned dataset | `data/cleaned/cleaned_air_quality.csv` |
| Model artefacts | `model.joblib`, `metrics.json`, feature schema |
| Formal statistics report | Full written report (Markdown / HTML / PDF) |
| Interactive dashboard | Live demonstration of exploration, classical statistics, insights, prediction, and evaluation |
| API service | Health, statistics, data, and prediction endpoints |

**Live demonstration URLs**

- Dashboard: https://business-stats-air-quality-project.vercel.app  
- API health: https://business-stats-airquality-project.onrender.com/health  

---

## 7. Operational usefulness

A reliable one-hour-ahead \(CO\) estimate can support:

1. Short-notice traffic signal or routing adjustments before peak accumulation.  
2. Precautionary guidance for sensitive populations near busy corridors.  
3. Cross-checks between low-cost sensors and expected pollution dynamics.

These uses are presented as analytical decision-support concepts grounded in the study’s forecast horizon and error profile.

---

## 8. Limitations

1. **Extreme peaks** are under-predicted relative to calmer periods.  
2. The model is calibrated to **one Italian roadside station** and should not be transferred to another city without local recalibration.  
3. The forecast horizon is **one hour ahead**, not multi-hour or day-ahead.  
4. Direct traffic counts and wind direction are **not** available in the feature set.

---

## 9. Group contributions

| Member | Primary responsibility |
|--------|------------------------|
| Farhan Sayed | System architecture, data engineering, API and dashboard integration |
| Salman Khan | Predictive modelling path and prediction demonstration alignment |
| Sahil Tambe | Statistical analysis and exploratory data analysis |
| Shruti Pawar | Insights visualisation and figure/dashboard consistency |
| Aayesha Kaliwala | Validation protocol, holdout metrics, and evaluation narrative |
| Kashish Maurya | Documentation, report assembly, and presentation materials |

---

## 10. Conclusion

AirWatch CO shows that careful cleaning of sentinel-coded telemetry, time-aware validation, classical statistical exploration, and a tuned non-linear ensemble can forecast next-hour urban Carbon Monoxide with strong holdout performance (**Test R² = 0.8337**, **Test RMSE = 0.5378 mg/m³**) while remaining transparent about failure modes. The accompanying notebooks, cleaned data, formal report, and live dashboard constitute a complete submission package for the MCA I Statistics Internal Assessment.

---

**Recommended accompanying files for submission**

1. This executive summary — `reports/AIRWATCH_CO_FINAL_EXECUTIVE_SUMMARY.pdf` (preferred for hand-in; also `.md` / `.html`)  
2. Full report — `reports/AIRWATCH_CO_FINAL_STATISTICS_REPORT.pdf` / `.html`  
3. Cleaned dataset — `data/cleaned/cleaned_air_quality.csv`  
4. Live dashboard URL (above)  

*Submitted by Group 3 — AirWatch CO*
