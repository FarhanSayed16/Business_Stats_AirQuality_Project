# Phase 2: Data Understanding & Variable Specification
**AirWatch CO | Group 3 — Air Quality and Pollution**

---

## 1. Dataset Overview

* **Source:** UCI Machine Learning Repository — Air Quality Data Set.
* **Recording Location:** Heavily polluted road-level area within an Italian city.
* **Sampling Rate:** Hourly averaged concentrations across 1 year (March 2004 to April 2005).
* **Raw Records:** 9,471 rows × 17 columns.
* **Effective Records:** 9,357 valid hourly timestamps (dropping 114 blank trailing rows and 2 trailing empty delimiter columns `Unnamed: 15` and `Unnamed: 16`).

---

## 2. Comprehensive Variable Dictionary

| Column Name | Data Type | Physical Meaning | Unit | Project Role |
| :--- | :--- | :--- | :--- | :--- |
| `Date` | String (`DD/MM/YYYY`) | Date of observation | N/A | Time Index / Calendar Feature |
| `Time` | String (`HH.MM.SS`) | Hour of observation | N/A | Time Index / Diurnal Feature |
| **`CO(GT)`** | Numeric (Float) | Reference True Carbon Monoxide Concentration | $\text{mg/m}^3$ | **Target `CO_next` (shifted by $t+1$) & Lag Feature** |
| `PT08.S1(CO)` | Numeric (Float) | Sensor response (Tin oxide, sensitive to CO) | Nominally resistance ($\Omega$) | Sensor Feature |
| `NMHC(GT)` | Numeric (Float) | Reference Non-Metanic HydroCarbons Concentration | $\mu\text{g/m}^3$ | Dropped (90.23% missing) |
| `C6H6(GT)` | Numeric (Float) | Reference Benzene Concentration | $\mu\text{g/m}^3$ | Pollutant Feature |
| `PT08.S2(NMHC)` | Numeric (Float) | Sensor response (Titania, sensitive to NMHC) | Nominally resistance ($\Omega$) | Sensor Feature |
| `NOx(GT)` | Numeric (Float) | Reference Nitrogen Oxides Concentration | $\text{ppb}$ | Pollutant Feature |
| `PT08.S3(NOx)` | Numeric (Float) | Sensor response (Tungsten oxide, sensitive to NOx) | Nominally resistance ($\Omega$) | Sensor Feature |
| `NO2(GT)` | Numeric (Float) | Reference Nitrogen Dioxide Concentration | $\mu\text{g/m}^3$ | Pollutant Feature |
| `PT08.S4(NO2)` | Numeric (Float) | Sensor response (Tungsten oxide, sensitive to NO2) | Nominally resistance ($\Omega$) | Sensor Feature |
| `PT08.S5(O3)` | Numeric (Float) | Sensor response (Indium oxide, sensitive to Ozone) | Nominally resistance ($\Omega$) | Sensor Feature |
| `T` | Numeric (Float) | Ambient Temperature | $^\circ\text{C}$ | Meteorological Feature |
| `RH` | Numeric (Float) | Relative Humidity | $\%$ | Meteorological Feature |
| `AH` | Numeric (Float) | Absolute Humidity | $\text{g/m}^3$ | Meteorological Feature |

---

## 3. Data Format & Missingness Profile

### 3.1 Format Quirks
* Delimiter is semicolon (`;`).
* Decimal mark is comma (`,`).
* Two empty trailing columns (`Unnamed: 15`, `Unnamed: 16`) exist due to trailing semicolons.
* Trailing empty rows exist at the end of the file (114 rows).

### 3.2 Sentinel Missing Value Coding (`-200`)
The monitoring hardware recorded `-200` as a sentinel error value when sensors were uncalibrated, disconnected, or saturating.

| Feature | Total Valid Rows | Count of `-200` | Missing % | Status / Action |
| :--- | :--- | :--- | :--- | :--- |
| `CO(GT)` | 9,357 | 1,683 | **17.99%** | Target; imputed for feature lags, dropped where target unknown |
| `PT08.S1(CO)` | 9,357 | 366 | **3.91%** | Imputed via time-aware interpolation |
| `NMHC(GT)` | 9,357 | 8,443 | **90.23%** | **Dropped** (unjustifiable missingness) |
| `C6H6(GT)` | 9,357 | 366 | **3.91%** | Imputed via time-aware interpolation |
| `PT08.S2(NMHC)`| 9,357 | 366 | **3.91%** | Imputed via time-aware interpolation |
| `NOx(GT)` | 9,357 | 1,639 | **17.52%** | Imputed via time-aware interpolation |
| `PT08.S3(NOx)` | 9,357 | 366 | **3.91%** | Imputed via time-aware interpolation |
| `NO2(GT)` | 9,357 | 1,642 | **17.55%** | Imputed via time-aware interpolation |
| `PT08.S4(NO2)` | 9,357 | 366 | **3.91%** | Imputed via time-aware interpolation |
| `PT08.S5(O3)` | 9,357 | 366 | **3.91%** | Imputed via time-aware interpolation |
| `T` | 9,357 | 366 | **3.91%** | Imputed via time-aware interpolation |
| `RH` | 9,357 | 366 | **3.91%** | Imputed via time-aware interpolation |
| `AH` | 9,357 | 366 | **3.91%** | Imputed via time-aware interpolation |

---

## 4. Modelling Target & Anti-Leakage Policy

### 4.1 Prediction Target: `CO_next`
$$\text{CO\_next}_t = \text{CO(GT)}_{t+1}$$
The objective is strictly next-hour forecasting (1-hour ahead lead time).

### 4.2 Feature Policy & Anti-Leakage Rules
* **Allowed Features at time $t$:**
  1. Instantaneous meteorological measurements at hour $t$: `T`, `RH`, `AH`.
  2. Instantaneous sensor readings at hour $t$: `PT08.S1` through `PT08.S5`.
  3. Ground-truth pollutant readings available at hour $t$: `CO(GT)`, `C6H6(GT)`, `NOx(GT)`, `NO2(GT)`.
  4. Historical lag features: `CO(GT)` at $t-1, t-2, t-3$, rolling 3-hour mean of `CO(GT)`.
  5. Deterministic calendar features derived from timestamp $t$: `hour` (0–23), `dayofweek` (0–6), `month` (1–12), `is_weekend` (0 or 1).
* **Forbidden Features (Data Leakage):**
  - Any ground-truth pollutant or sensor value from $t+1, t+2, \dots$
  - Any rolling window calculation that centers on or peeks into future timestamps.
  - Random train/test split (random k-fold cross-validation is strictly forbidden due to temporal autocorrelation). Chronological splits only.
