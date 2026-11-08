# AirWatch CO: Usefulness & Limitations Analysis
**MCA I Statistics Internal Assessment | Group 3 — Air Quality and Pollution**

---

## 1. Operational Usefulness in Municipal Air Quality Management

Predicting next-hour Carbon Monoxide ($CO$) concentrations with an $R^2$ of **0.8337** and a mean absolute error of **0.36 mg/m³** enables practical municipal interventions:

### 1.1 Proactive Traffic & Congestion Routing
* Carbon Monoxide in urban street canyons is almost exclusively produced by incomplete internal combustion from stop-and-go vehicular traffic.
* A 1-hour advance warning of an impending spike allows municipal traffic controllers to adjust traffic light cycles, divert commercial heavy vehicles to arterial bypasses, or activate variable message signage before severe street stagnation occurs.

### 1.2 Public Health & Sensitive Population Advisories
* High $CO$ levels severely impair oxygen transport via carboxyhemoglobin formation, disproportionately threatening individuals with cardiovascular disease, asthma, and the elderly.
* Next-hour forecasts allow schools, outdoor athletic facilities, and senior care centers located near arterial transit corridors to bring activities indoors prior to peak rush-hour accumulation.

### 1.3 Solid-State Sensor Drift & Calibration Monitoring
* Low-cost solid-state metal oxide chemical sensors (`PT08.S1`–`PT08.S5`) suffer from thermal drift and ambient humidity sensitivity.
* By comparing sensor predictions against real-time baseline expectations, municipal monitoring networks can detect when low-cost sensor clusters fall out of calibration without requiring continuous on-site reference gas maintenance.

---

## 2. Statistical Failure Modes & System Limitations

Honest academic reporting requires analyzing where the model degrades:

### 2.1 Failure Under Severe Pollution Episodes (Underestimation of Extreme Peaks)
* As demonstrated in our failure analysis (`figures/10_error_by_hour_and_magnitude.png`), model prediction error increases monotonically with pollution severity:
  * For low concentrations ($CO < 1.5\text{ mg/m}^3$), MAE is **0.23 mg/m³**.
  * For extreme episodes ($CO > 5.0\text{ mg/m}^3$), MAE increases to **1.14 mg/m³**.
* **Reason:** Tree-based gradient boosting models partition feature space into piecewise constant leaves and cannot extrapolate beyond the maximum value seen in training nodes. Consequently, rare, sudden, super-extreme pollution spikes are systematically underestimated.

### 2.2 Microclimatic & Spatial Stationarity
* The UCI dataset originates from a single fixed monitoring station located at road level in an Italian city.
* The model captures the specific localized microclimate, street canyon geometry, and traffic flow patterns of this single intersection. It cannot be deployed in another urban location without recalibration.

### 2.3 Short-Horizon Lead Time ($t+1$ Hour)
* While 1-hour forecasts achieve high fidelity due to atmospheric inertia, extending the prediction horizon to $t+6$ or $t+24$ hours causes error accumulation. Medium- and long-term forecasts require numerical weather prediction (NWP) dispersion simulations.

### 2.4 Unobserved Exogenous Shock Variables
* The feature space contains chemical sensors and meteorological readings ($T, RH, AH$), but lacks direct telemetry on:
  * Real-time vehicle counts or average fleet speed.
  * Wind velocity and wind direction (which govern street canyon ventilation).
  * Road closures, public transit strikes, or sudden municipal construction events.

---

## 3. Methodological Safeguards Against Data Leakage

1. **Chronological Splitting:** Enforced strict time ordering (Train: March–Dec 2004, Val: Dec 2004–Feb 2005, Test: Feb–April 2005). Standard randomized K-Fold splits would cause severe temporal data leakage due to autoregressive autocorrelation.
2. **Feature Causality:** All engineered lags ($t-1, t-2, t-3$) and rolling metrics strictly use current and historical observations. Future features ($t+1$) are strictly forbidden in $X$.
