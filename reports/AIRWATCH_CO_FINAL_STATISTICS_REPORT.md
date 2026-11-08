# AirWatch CO: Predictive Modelling and Statistical Analysis of Urban Carbon Monoxide Concentrations

**MCA I Statistics Internal Assessment | Group 3 — Air Quality and Pollution**  
**Academic Year:** 2024–2025 / 2025–2026  
**Primary Author / Lead Contributor:** Farhan Sayed & Group 3 Team  
**Dataset:** UCI Machine Learning Repository — Air Quality Data Set (CNR-ISAC, Italy)  

---

## 1. Executive Summary & Problem Formulation

Airborne pollutants in dense metropolitan street canyons represent a critical determinant of respiratory and cardiovascular morbidity. Among primary combustion byproducts, Carbon Monoxide ($CO$) is a toxic, colorless gas primarily emitted by incomplete combustion in motor vehicle engines. Because urban traffic follows diurnal rhythms dictated by human mobility, ground-level $CO$ exhibits sharp temporal variations that challenge stationary air-quality management networks.

This study implements an end-to-end statistical analysis and predictive forecasting pipeline for Carbon Monoxide concentrations using the official UCI **Air Quality** dataset, comprising 9,358 valid hourly observations recorded from March 2004 through April 2005 at road level within an Italian city. 

### Core Research Objective
*Given current hourly meteorological readings ($T, RH, AH$), solid-state chemical sensor responses, and reference pollutant concentrations, can we reliably forecast next-hour Carbon Monoxide concentration ($CO_{t+1}$) without temporal data leakage?*

### Key Results Summary
1. **Benchmark Persistence Baseline:** Predicting $CO_{t+1} = CO_t$ achieves a Test RMSE of **0.7739 mg/m³** ($R^2 = 0.6556$).
2. **Standardized Linear Regression:** Yields modest gains with a Test RMSE of **0.7556 mg/m³** ($R^2 = 0.6717$), identifying current $CO$, proxy sensor resistance, and temperature shifts as the dominant linear drivers.
3. **Tuned Non-Linear Ensemble (`HistGradientBoostingRegressor`):** Optimized via 5-fold `TimeSeriesSplit` cross-validation, the final model attains a Test RMSE of **0.5378 mg/m³**, a Test MAE of **0.3608 mg/m³**, and a coefficient of determination ($R^2$) of **0.8337**.
4. **Error Reduction:** Achieves a **30.50% reduction in Root Mean Squared Error** relative to the naive persistence benchmark.

---

## 2. Dataset Understanding & Variable Dictionary

The dataset originates from field deployment of a multi-sensor device co-located with an official European reference analyzer at road level in a heavily trafficked urban area.

### 2.1 Variable Specification

| Variable | Physical Meaning | Dimension / Unit | Project Role |
| :--- | :--- | :--- | :--- |
| `Date`, `Time` | Observation timestamp | Date (`DD/MM/YYYY`), Time (`HH.MM.SS`) | Time-series indexing; calendar feature extraction |
| **`CO(GT)`** | Reference analyzer true Carbon Monoxide | $\text{mg/m}^3$ | **Primary Forecasting Target ($CO_{t+1}$) & Lags** |
| `PT08.S1(CO)` | Tin oxide semiconductor sensor (nominally CO) | Resistance ($\Omega$) | Chemical sensor predictor |
| `NMHC(GT)` | Reference Non-Methane Hydrocarbons | $\mu\text{g/m}^3$ | Pruned (>90% missing) |
| `C6H6(GT)` | Reference Benzene concentration | $\mu\text{g/m}^3$ | Pollutant co-emission predictor |
| `PT08.S2(NMHC)` | Titania semiconductor sensor (nominally NMHC) | Resistance ($\Omega$) | Chemical sensor predictor |
| `NOx(GT)` | Reference Nitrogen Oxides | $\text{ppb}$ | Pollutant co-emission predictor |
| `PT08.S3(NOx)` | Tungsten oxide sensor (nominally NOx) | Resistance ($\Omega$) | Chemical sensor predictor (negative correlation) |
| `NO2(GT)` | Reference Nitrogen Dioxide | $\mu\text{g/m}^3$ | Pollutant co-emission predictor |
| `PT08.S4(NO2)` | Tungsten oxide sensor (nominally NO2) | Resistance ($\Omega$) | Chemical sensor predictor |
| `PT08.S5(O3)` | Indium oxide sensor (nominally Ozone) | Resistance ($\Omega$) | Chemical sensor predictor |
| `T` | Ambient Temperature | $^\circ\text{C}$ | Meteorological driver |
| `RH` | Relative Humidity | $\%$ | Meteorological driver |
| `AH` | Absolute Humidity | $\text{g/m}^3$ | Meteorological driver |

---

## 3. Data Cleansing & Preprocessing Methodology

### 3.1 Sentinel Value Identification (`-200`)
The telemetry hardware utilized `-200` as a sentinel error code indicating uncalibrated sensors, power dropouts, or saturation. Treating `-200` as numeric values distorts all statistical moments (mean, variance, skewness). Across the 9,357 valid hourly records:
* `NMHC(GT)`: Missing 8,443 records (**90.23%**).
* `CO(GT)`: Missing 1,683 records (**17.99%**).
* `NOx(GT)` & `NO2(GT)`: Missing ~1,640 records (**17.5%**).
* Solid-State Sensors & Weather: Missing 366 records (**3.91%**).

### 3.2 Imputation & Column Pruning Rationale
* **Pruning `NMHC(GT)`:** Attempting to impute 90.2% of missing entries introduces synthetic noise and destroys model validity. The column was dropped; its proxy sensor `PT08.S2(NMHC)` was retained.
* **Time-Aware Linear Interpolation:** For sensors and meteorological readings exhibiting short contiguous dropouts ($\le 6$ hours), time-based linear interpolation along the datetime index was applied. Remaining boundary edges were filled via bounded forward/backward fill.
* **Target Preservation:** Original ground-truth values were preserved as `CO_GT_raw` to guarantee test evaluation against uncorrupted analyzer observations.

### 3.3 Feature Engineering
To enable regression models to capture temporal cycles and physical inertia:
1. **Calendar Features:** `hour` (0–23), `day_of_week` (0–6), `month` (1–12), `is_weekend` (0 or 1).
2. **Cyclical Transforms:** Harmonic sine and cosine encodings for hour ($\tau = 24$) and month ($\tau = 12$) preserving boundary continuity (e.g. 23:00 to 00:00).
3. **Autoregressive Lags:** $CO_{t-1}, CO_{t-2}, CO_{t-3}$ to capture atmospheric memory.
4. **Rolling Smoothing:** 3-hour backward rolling mean of $CO$ ($\overline{CO}_{3h}$).
5. **Sensor/Weather Lags:** Lags of key proxy sensors (`PT08.S1`, `PT08.S2`) and weather variables ($T, RH$).

### 3.4 Chronological Split Masks
Because air pollution data exhibits strong autocorrelation, standard randomized K-Fold splits produce severe data leakage and artificially inflated scores. Strict chronological boundaries were enforced:
* **Train Partition (70%):** 6,547 observations (March 10, 2004 to December 8, 2004).
* **Validation Partition (15%):** 1,403 observations (December 8, 2004 to February 5, 2005).
* **Holdout Test Partition (15%):** 1,403 observations (February 5, 2005 to April 4, 2005).

---

## 4. Exploratory Data Analysis & Empirical Findings

### 4.1 Diurnal Rush-Hour Signature
Hourly aggregation reveals a distinct **bimodal diurnal profile**:
* **Morning Commute Surge:** Concentrations rise steeply from 06:00, peaking at **08:00–09:00 AM** (mean 2.72 mg/m³) due to morning traffic.
* **Midday Dispersion:** Midday solar heating elevates the planetary boundary layer height, promoting convective dilution between 13:00 and 15:00.
* **Evening Commute & Nocturnal Trapping:** Concentrations peak at **18:00–20:00 PM** (mean 3.12 mg/m³) as evening traffic coincides with nocturnal boundary layer descent and thermal radiation cooling.

### 4.2 Weekly Traffic Respite
Analysis across weekdays confirms that Monday through Friday sustain high median $CO$ levels (~2.0 mg/m³). Commercial activity drops on Saturday, reaching an absolute weekly minimum on **Sunday** (mean 1.54 mg/m³), confirming vehicle traffic as the overwhelming emission source.

### 4.3 Sensor Sensitivity & Cross-Pollutant Correlation
* `CO(GT)` exhibits high positive correlation with `C6H6(GT)` ($r = 0.88$) and `NOx(GT)` ($r = 0.79$), confirming co-emission from gasoline and diesel exhaust.
* Tin oxide sensor `PT08.S1(CO)` ($r = 0.82$) and titania sensor `PT08.S2(NMHC)` ($r = 0.87$) show strong linear sensitivity, demonstrating their capability to serve as real-time proxies.
* Tungsten oxide sensor `PT08.S3(NOx)` exhibits strong negative correlation ($r = -0.70$), consistent with the semiconductor resistance increase characteristic of oxidising gas exposure.

---

## 5. Model Architecture & Cross-Validation

### 5.1 Evaluated Model Families
1. **Persistence Baseline:** $\hat{y}_{t+1} = y_t$ (persistence assumption).
2. **Standardized Linear Regression:** $\hat{y} = \beta_0 + \sum \beta_i z_i$.
3. **L2 Regularized Ridge Regression:** Optimizing penalty $\alpha = 10.0$.
4. **Random Forest Regressor:** 100 estimators, max depth 12.
5. **Histogram-based Gradient Boosting Regressor (`HistGradientBoostingRegressor`):** Binned gradient-boosted decision trees.

### 5.2 Time-Series Hyperparameter Optimization
Using `TimeSeriesSplit(n_splits=5)` on historical calibration data, grid search converged on the following optimal hyperparameters for `HistGradientBoostingRegressor`:
* `learning_rate`: **0.1**
* `max_iter`: **100**
* `max_depth`: **10**
* `min_samples_leaf`: **20**
* `l2_regularization`: **0.5**

---

## 6. Final Comparative Results (Holdout Test Evaluation)

| Model Architecture | Validation RMSE ($\text{mg/m}^3$) | Validation $R^2$ | Test RMSE ($\text{mg/m}^3$) | Test MAE ($\text{mg/m}^3$) | Test $R^2$ | Error Reduction vs Baseline |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Persistence Baseline** | 0.7832 | 0.7591 | 0.7739 | 0.4996 | 0.6556 | Baseline Reference |
| **Linear Regression** | 0.7698 | 0.7673 | 0.7556 | 0.6035 | 0.6717 | +2.4% RMSE reduction |
| **Ridge Regression** | 0.7761 | 0.7634 | 0.7641 | 0.6156 | 0.6642 | +1.3% RMSE reduction |
| **Random Forest** | 0.6806 | 0.8181 | 0.5969 | 0.4232 | 0.7951 | +22.9% RMSE reduction |
| **Tuned HistGradientBoosting** | **0.6621** | **0.8278** | **0.5378** | **0.3608** | **0.8337** | **+30.50% RMSE reduction** |

---

## 7. Operational Usefulness in Municipal Management

1. **Intelligent Traffic Management:** A 1-hour advance warning of an impending $CO$ accumulation enables municipal traffic centers to dynamically adjust signal phases or redirect heavy transit to peripheral bypass routes before street canyon saturation occurs.
2. **Public Health Advisory Dispatch:** Carbon Monoxide binds readily with hemoglobin, impairing cellular oxygen transport. Advance notices allow schools, outdoor athletic centers, and elderly care facilities to curtail strenuous outdoor activity prior to peak commuter spikes.
3. **Solid-State Sensor Cluster Drift Detection:** Discrepancies between sensor readings and multi-feature model forecasts provide an automated diagnostic indicator for sensor calibration decay.

---

## 8. Statistical Limitations & Failure Mode Analysis

1. **Underestimation of Extreme High-Pollution Spikes:** Regression trees partition feature space into constant leaf values and cannot extrapolate beyond maximum training bounds. For extreme spikes ($CO > 5.0\text{ mg/m}^3$), MAE rises from 0.23 to 1.14 mg/m³.
2. **Microclimatic Stationarity:** The model is calibrated to a specific Italian urban intersection. Local street canyon topography, building heights, and localized wind eddies prevent direct transference to other cities without localized recalibration.
3. **Absence of Real-Time Vehicle Counts:** The model infers traffic indirectly from chemical concentrations and temporal encodings; it cannot anticipate sudden traffic halts caused by emergency road closures.

---

## 9. System Enhancement: Interactive Web Dashboard

To bridge the gap between academic code and real-world stakeholder utility, an interactive monitoring dashboard was developed (**AirWatch CO**):
* **FastAPI Backend:** Asynchronous Python service exposing `/stats`, `/data`, `/model/predict`, and `/model/evaluation`.
* **React + Vite Interface:** Built with TypeScript, Tailwind CSS, and Recharts, offering 6 screens (Home, Explore Data, Insights, Predict Lab, Evaluation, Team).
* **Live Prediction Studio:** Allows selecting historical holdout observations or testing arbitrary parameters with real-time health severity categorization.

---

## 10. Group Member Contributions

* **Farhan Sayed (Data & Architecture Lead):** Cleaned dataset curation, delimiter and `-200` sentinel filtering, time-aware interpolation, chronological train/val/test masking, FastAPI REST architecture, React dashboard development, and report compilation.
* **Group 3 Team Member (EDA & Analytics Lead):** Univariate summary metrics, diurnal rush-hour curve analysis, weekday distribution analysis, correlation heatmap calculations, and visualization styling.
* **Group 3 Team Member (Predictive Modelling Lead):** Target definition ($CO_{next}$), baseline formulation, standardized Linear/Ridge regression, 5-fold `TimeSeriesSplit` cross-validation, and serialisation of `model.joblib` and `metrics.json`.

---

## 11. Conclusion & Recommendations

The AirWatch CO study demonstrates that next-hour Carbon Monoxide concentrations can be predicted with high precision ($R^2 = 0.8337$, $\text{RMSE} = 0.5378\text{ mg/m}^3$) using historical sensor telemetry, meteorological conditions, and autoregressive lags without temporal data leakage. Integrating machine learning forecasts into municipal traffic and public health infrastructure provides actionable lead time for mitigation, establishing the practical value of statistical modelling in environmental data science.
