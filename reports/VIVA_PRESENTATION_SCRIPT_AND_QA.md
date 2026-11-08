# AirWatch CO: Viva Presentation Script & Defense Q&A Guide

**MCA I Statistics Internal Assessment | Group 3 — Air Quality and Pollution**

---

## 1. 8–10 Minute Class Presentation Script

### Minute 0:00 – 1:00 | Introduction & Project Hook
> *"Good morning respected professor and fellow classmates. We are Group 3, and today we present **AirWatch CO**, our statistical investigation and predictive modelling project on urban air pollution using the UCI Air Quality dataset.*
>
> *Carbon Monoxide is a toxic, odorless combustion pollutant predominantly emitted by idling motor vehicle traffic in street canyons. Our core research question was: **Can we reliably forecast next hour's Carbon Monoxide level using only current sensor, pollutant, and weather readings without future data leakage?**"*

---

### Minute 1:00 – 2:30 | Dataset Understanding & The Hardware Quirk
> *"The dataset consists of approximately 9,358 hourly records from an urban station in Italy across one full year (March 2004 to April 2005).*
>
> *When we first ingested the data, we identified a critical hardware anomaly: missing or invalid sensor telemetry was recorded as **`-200`**, not as blanks. If left untreated, these negative values would completely corrupt all means, standard deviations, and regression models.
>
> *We converted all `-200` values to nulls and discovered that `NMHC(GT)` was missing **90.2%** of its entries. We made the justified statistical decision to prune `NMHC(GT)` to avoid injecting synthetic noise, while imputing short continuous telemetry gaps ($\le 6$ hours) using time-based linear interpolation.*
>
> *Crucially, we defined our prediction target as strictly next hour's reference Carbon Monoxide ($CO_{next} = CO(GT)_{t+1}$), and enforced strict **chronological partitions** (70% Train, 15% Validation, 15% Test) to prevent temporal data leakage."*

---

### Minute 2:30 – 5:00 | Exploratory Data Analysis & Empirical Patterns
> *(Navigate to the **Insights** page on the AirWatch CO dashboard)*
>
> *"Our exploratory data analysis revealed three definitive statistical patterns:*
>
> *1. **The Bimodal Diurnal Signature:** Hourly profiling shows two prominent rush-hour surges: morning commute at **8:00–9:00 AM** and evening commute at **6:00–8:00 PM**, followed by night-time boundary layer cooling that traps pollutants.*
> *2. **The Sunday Traffic Lull:** Concentrations remain high Monday through Friday, but drop to a weekly minimum on **Sunday**, where median CO drops by nearly 35%, confirming traffic as the primary emission source.*
> *3. **Chemical Sensor Proxy Sensitivity:** Solid-state metal oxide sensors `PT08.S1(CO)` ($r = 0.82$) and `PT08.S2(NMHC)` ($r = 0.87$) correlate exceptionally well with true reference CO, demonstrating that low-cost distributed sensors can provide strong predictive signals."*

---

### Minute 5:00 – 7:30 | Predictive Modelling & Live Demonstration
> *(Navigate to the **Predict** page on the AirWatch CO dashboard)*
>
> *"To evaluate predictive power honestly, we started with a **Naive Persistence Baseline** ($\hat{y}_{t+1} = y_t$). This benchmark achieved a Test RMSE of **0.7739 mg/m³** and an $R^2$ of **0.6556**.*
>
> *Standardized Linear Regression yielded slight improvements ($R^2 = 0.6717$), revealing that current CO and temperature differentials govern short-term trends.*
>
> *We then trained non-linear tree ensembles and conducted 5-fold `TimeSeriesSplit` hyperparameter tuning on **`HistGradientBoostingRegressor`**.*
>
> *On our untouched holdout test partition, our tuned model achieved:*
> * • **Test RMSE: 0.5378 mg/m³**
> * • **Test MAE: 0.3608 mg/m³**
> * • **Test R²: 0.8337**
> *This represents a **30.50% reduction in prediction error** over the persistence baseline.*
>
> *(Click a timestamp in the live demo dropdown)*
> *As demonstrated here live on the dashboard, selecting an actual observation from the test set generates an instant next-hour forecast of 0.51 mg/m³ against an actual observed value of 0.60 mg/m³ — an error of just 0.09 mg/m³."*

---

### Minute 7:30 – 9:00 | Operational Usefulness vs Critical Limitations
> *(Navigate to the **Evaluation** page)*
>
> *"A rigorous statistics assessment must address where the system succeeds and where it fails:*
>
> * **Operational Usefulness:** A 1-hour lead warning gives municipal controllers actionable time to adjust traffic signal timings or redirect freight traffic to bypass routes. Furthermore, public health alerts can be issued to schools and athletic centers to bring sensitive individuals indoors before peak commuter smog accumulates.*
> * **Statistical Limitations & Failure Modes:** As shown in our residual analysis, tree-based models cannot extrapolate beyond the maximum bounds seen in training data. Consequently, during rare, extreme pollution episodes ($CO > 5.0\text{ mg/m}^3$), prediction error increases from 0.23 to 1.14 mg/m³, systematically underestimating peak spikes.*
> * Furthermore, the model is calibrated to a single microclimate in Italy and cannot be deployed in another city without localized recalibration."*

---

### Minute 9:00 – 10:00 | Conclusion & Q&A
> *"In conclusion, AirWatch CO demonstrates that time-aware machine learning combined with solid-state sensors can accurately predict next-hour urban pollution without future data leakage.*
>
> *We have submitted our academic Python notebooks, cleaned dataset, and comprehensive report, while packaging our findings into this live interactive dashboard for accessible stakeholder decision-making.*
>
> *Thank you, and we welcome your questions!"*

---

## 2. Top 10 Anticipated Viva Questions & Defenses

### Q1: Why did you drop `NMHC(GT)` instead of imputing it?
**Answer:**  
`NMHC(GT)` was missing 8,443 out of 9,357 records — over **90.2%** missingness. Imputing more than 90% of a feature means the model would be training on synthetic artifacts rather than empirical reality, introducing high artificial variance. Pruning the column was the only statistically defensible choice, especially since sensor `PT08.S2(NMHC)` was available as an alternative proxy.

### Q2: What is data leakage, and how did you prevent it?
**Answer:**  
Data leakage occurs when information from the future or from the test set inadvertently influences model training. We prevented it in two ways:
1. **Feature causality:** Features at row $t$ strictly contain information up to hour $t$ (e.g. current readings, lags $t-1, t-2, t-3$, rolling means). No forward-looking calculations were allowed.
2. **Chronological partitioning:** We used strict time-based splits (Train: Mar–Dec 2004, Val: Dec 2004–Feb 2005, Test: Feb–Apr 2005) and `TimeSeriesSplit` for cross-validation. Random K-Fold splits would cause severe leakage due to autocorrelation.

### Q3: Why is the naive persistence baseline so important in time-series?
**Answer:**  
Atmospheric pollutants exhibit high temporal autocorrelation — next hour's pollution is naturally correlated with the current hour. A persistence model ($\hat{y}_{t+1} = y_t$) already achieves an $R^2$ of ~0.65 simply by repeating the previous value. If a complex machine learning model does not convincingly beat persistence, it has no practical utility. Our tuned model reduced RMSE by **30.5%** over persistence, proving genuine predictive value.

### Q4: Why did `HistGradientBoostingRegressor` outperform Linear Regression?
**Answer:**  
Linear regression assumes additive, monotonic relationships. In reality, atmospheric dispersion involves complex, non-linear physical interactions — for example, photochemical smog and diurnal boundary layer fluctuations create threshold effects. Gradient-boosted trees naturally capture these non-linear thresholds and high-order feature interactions without requiring manual polynomial feature expansion.

### Q5: How did you handle cyclical features like Hour and Month?
**Answer:**  
Standard integers treat 23:00 and 00:00 as maximally distant (23 units apart), even though they are consecutive hours. We applied trigonometric transformations:
$$\text{hour\_sin} = \sin\left(\frac{2\pi \cdot \text{hour}}{24}\right), \quad \text{hour\_cos} = \cos\left(\frac{2\pi \cdot \text{hour}}{24}\right)$$
This maps the 24-hour cycle onto a continuous unit circle, ensuring that 23:00 and 00:00 are adjacent in Euclidean space.

### Q6: Where does your model fail or perform worst?
**Answer:**  
Our failure analysis (`figures/10_error_by_hour_and_magnitude.png`) proved that error degrades primarily during **extreme pollution spikes** ($CO > 5\text{ mg/m}^3$), where MAE increases to 1.14 mg/m³. Decision trees cannot extrapolate values outside their training leaf partitions, causing the model to systematically underestimate sudden extreme peaks.

### Q7: Why did you build a React dashboard if the assignment requires Python?
**Answer:**  
The official college submission is 100% satisfied by our Python academic core: 4 Jupyter notebooks (`01` through `04`), the cleaned dataset, and our formal report. The React dashboard is a presentation enhancement that consumes a Python FastAPI service. It demonstrates how academic data science can be packaged into an operational tool for municipal stakeholders.

### Q8: What is the physical meaning of negative correlation in `PT08.S3(NOx)`?
**Answer:**  
`PT08.S3` is a metal oxide semiconductor sensor. Its electrical conductivity increases (and therefore its resistance decreases) in the presence of reducing gases, but in the presence of oxidising gases like $NO_x$, oxygen ions bind to the surface, increasing resistance. The negative correlation with $CO$ ($r \approx -0.70$) reflects the inverse chemical behavior of the sensor when exposed to oxidising species.

### Q9: Could this model be used in Mumbai, London, or New York directly?
**Answer:**  
No. The model captures the specific localized microclimate, street canyon geometry, and traffic flow patterns of this single urban station in Italy. Deploying it in another city would require transfer learning and fine-tuning on local sensor networks.

### Q10: What would you do next to improve this project?
**Answer:**  
1. Incorporate **direct real-time traffic volume feeds** (induction loop vehicle counts).
2. Add **wind velocity and wind direction** measurements to model street canyon dispersion.
3. Multi-horizon forecasting ($t+1, t+3, t+6, t+12$ hours) using sequence-to-sequence neural architectures (LSTMs or Temporal Fusion Transformers).
