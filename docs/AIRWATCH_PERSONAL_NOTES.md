# AirWatch CO — Project Technical Summary

**MCA I Statistics Internal Assessment**  
**Group 3 — Air Quality and Pollution**

| | |
|--|--|
| Interactive dashboard | https://business-stats-air-quality-project.vercel.app |
| Prediction API | https://business-stats-airquality-project.onrender.com |
| Supporting diagrams | [`diagrams/`](diagrams/) |

---

## 1. Project overview

**AirWatch CO** is a statistical modelling and demonstration system for short-horizon urban air-pollution forecasting.

| Item | Detail |
|------|--------|
| Dataset | UCI Air Quality (hourly) |
| Location | Italian urban roadside monitoring station |
| Period | March 2004 – April 2005 |
| Modelling sample | 9,353 cleaned hourly records |
| Academic core | Python notebooks (preprocessing → EDA → modelling → tuning) |
| Presentation layer | FastAPI backend + React dashboard |

---

## 2. Research problem

Using only information available **up to the current hour** — ambient weather, metal-oxide sensor responses, and current pollutant concentrations — the project asks:

> Can next-hour reference Carbon Monoxide concentration, \(\mathrm{CO(GT)}\), be predicted reliably without temporal data leakage?

**Prediction target**

\[
\mathrm{CO\_next}_t = \mathrm{CO(GT)}_{t+1}
\]

Features at time \(t\) may include current and past values only. Values from hour \(t+1\) are never used as inputs.

---

## 3. Data cleaning and preparation

### 3.1 Hardware sentinel values (\(-200\))

In the raw file, invalid or missing sensor readings are coded as **\(-200\)**, not as blank cells. If these codes are treated as ordinary numeric concentrations, every descriptive statistic and every model becomes biased.

**Action taken:** all \(-200\) entries were replaced with missing values (NaN) before analysis.

### 3.2 Additional preparation steps

| Step | Rationale |
|------|-----------|
| Drop `NMHC(GT)` (~90% missing) | Imputing most of a column would inject synthetic noise |
| Time-aware linear interpolation for short gaps | Preserves continuity of hourly series where dropouts are brief |
| Chronological train / validation / test masks (70% / 15% / 15%) | Respects time order of atmospheric processes |
| Feature engineering (lags, rolling means, hour/month cycles) | Captures persistence and diurnal seasonality without future leakage |

---

## 4. Validation strategy

| Adopted | Rejected |
|---------|----------|
| Chronological holdout split | Random train/test shuffle |
| `TimeSeriesSplit` for hyperparameter tuning | Standard random \(K\)-fold CV |

Air-quality measurements are strongly autocorrelated. Random folds would place future hours into training and past hours into testing, producing **temporal leakage** and over-optimistic scores. Time-ordered validation prevents that error.

---

## 5. Evaluation metrics

| Metric | Meaning | Preferred direction |
|--------|---------|---------------------|
| **RMSE** | Root Mean Squared Error — penalises larger mistakes more heavily | Lower is better |
| **MAE** | Mean Absolute Error — average absolute deviation | Lower is better |
| **R²** | Coefficient of determination — share of variance explained | Higher is better |

All final comparisons below use the **chronological holdout test** partition.

---

## 6. Models: what each does, and how they performed

Five approaches were compared so that gains could be judged against a strong naive reference and against both linear and tree-based learners.

### Holdout test summary

| Model | Test RMSE | Test MAE | Test R² |
|-------|-----------|----------|---------|
| Persistence baseline | 0.7739 | 0.4996 | 0.6556 |
| Linear Regression | 0.7556 | 0.6035 | 0.6717 |
| Ridge Regression (\(\alpha = 10\)) | 0.7641 | 0.6156 | 0.6642 |
| Random Forest | 0.5842 | 0.4032 | 0.8037 |
| **Tuned HistGradientBoosting (selected)** | **0.5378** | **0.3608** | **0.8337** |

Relative to persistence, the selected model reduces RMSE by approximately **30.5%**.

---

### 6.1 Persistence baseline

**What it does**  
Predicts next-hour CO as equal to the **current** hour’s CO:

\[
\hat{y}_{t+1} = \mathrm{CO(GT)}_t
\]

**Why it is useful**  
CO changes slowly from hour to hour. This naive rule is therefore a strong benchmark.

**Why it is not enough**  
It cannot react to weather shifts, sensor signals, or rush-hour structure beyond “tomorrow equals today.” Error remains higher than methods that use additional explanatory features (Test R² = 0.6556).

---

### 6.2 Linear Regression

**What it does**  
Fits a weighted sum of standardised features (current CO, sensors, weather, calendar encodings, lags) to predict \(\mathrm{CO\_next}\). Coefficients are easy to interpret.

**Why it only improves slightly**  
The relationship between pollution, traffic rhythm, and meteorology is **not purely linear**. Interactions and threshold effects (for example sudden evening peaks) are poorly captured by a straight additive model. Test R² rises only to 0.6717, and MAE is actually worse than persistence on this holdout.

---

### 6.3 Ridge Regression

**What it does**  
Same linear structure as ordinary regression, but with **L2 regularisation** to shrink large coefficients and reduce overfitting when predictors are correlated (sensors and pollutants often move together).

**Why it still underperforms trees**  
Regularisation stabilises the linear model but does not add non-linear capacity. On this problem Ridge remains close to ordinary linear regression (Test R² = 0.6642) and does not model diurnal / interaction structure as flexibly as tree ensembles.

---

### 6.4 Random Forest

**What it does**  
Builds many decision trees on bootstrap samples and averages their predictions. Trees can split on hour-of-day, humidity bands, sensor ranges, and other non-linear patterns.

**Why it works better — but is not the final choice**  
It substantially beats the linear family (Test R² = 0.8037; RMSE = 0.5842). Remaining gap versus gradient boosting: a plain forest averages trees independently and was not as carefully tuned under time-series cross-validation as the boosting model. Boosting typically reduces residual error more efficiently on structured tabular series of this type.

---

### 6.5 Tuned HistGradientBoosting (selected champion)

**What it does**  
Builds trees **sequentially**, each tree correcting errors left by the previous ones (gradient boosting). Hyperparameters (`learning_rate`, `max_depth`, `max_iter`, leaf regularisation, etc.) were selected with **TimeSeriesSplit**, then evaluated once on the untouched holdout window.

**Why it works best here**  
It combines non-linear splits with iterative error correction and time-aware tuning. Holdout scores are strongest: RMSE **0.5378**, MAE **0.3608**, R² **0.8337**.

**Where even the champion is limited**  
On rare extreme pollution spikes, error still rises (tree models do not extrapolate far beyond patterns seen in training). The model is also calibrated to one station and a one-hour horizon only. These limits are discussed in the evaluation section of the dashboard and formal report.

---

## 7. Supporting statistical analysis

Beyond model comparison, the project includes classical Business Statistics views used in the dashboard **Statistics** module:

- **IQR outlier fences** — lower = \(Q_1 - 1.5\times\mathrm{IQR}\), upper = \(Q_3 + 1.5\times\mathrm{IQR}\); left/lower versus right/upper outliers. Extreme CO values are often genuine peaks and are flagged for interpretation rather than deleted en masse.  
- **Distribution analysis** — histogram with Normal(\(\mu,\sigma\)) overlay; CO is right-skewed, so the normal curve is a comparative reference.  
- **Empirical probabilities** — percentiles and frequency-based probabilities for analytical CO tiers.  
- **EDA patterns** — bimodal diurnal rush hours, Sunday activity lull, weather coupling, and cross-pollutant / sensor correlations.

---

## 8. System deliverables

| Deliverable | Role |
|-------------|------|
| Jupyter notebooks `01`–`04` | Academic pipeline |
| `data/cleaned/cleaned_air_quality.csv` | Submission-ready cleaned data |
| `artifacts/model.joblib`, `metrics.json` | Champion model and metric source of truth |
| Formal report (MD / HTML / PDF) | Written assessment |
| Live dashboard + API | Interactive demonstration of cleaning, statistics, insights, prediction, and evaluation |

---

## 9. Project process diagrams

| Figure | Description |
|--------|-------------|
| [`diagrams/01_end_to_end_pipeline.png`](diagrams/01_end_to_end_pipeline.png) | End-to-end pipeline from UCI data to live dashboard |
| [`diagrams/02_cleaning_and_validation.png`](diagrams/02_cleaning_and_validation.png) | Sentinel cleaning and time-aware validation |
| [`diagrams/03_models_and_metrics.png`](diagrams/03_models_and_metrics.png) | Model candidates, metrics, and champion selection |

Editable PlantUML sources are stored alongside the PNG files.

---

## 10. Limitations (summary)

1. Prediction error increases during severe CO episodes.  
2. Results are specific to a single Italian roadside station.  
3. Forecast horizon is restricted to the next hour.  
4. Direct traffic counts and wind direction are not available in the feature set.

---

*Group 3 · AirWatch CO · MCA I Statistics Internal Assessment*
