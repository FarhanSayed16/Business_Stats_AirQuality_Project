# Business Statistics Enhancement Plan (Classical Only)

**AirWatch CO · MCA I Statistics · Group 3**

This document is the working blueprint for professor-facing classical Business Statistics content on the dashboard. It matches the locked product decisions below.

---

## 1. Locked scope

| In scope | Out of scope (ignore completely) |
|----------|----------------------------------|
| IQR fences, left/lower & right/upper outliers | Full Bayesian regression |
| Histograms + normal / density (bell) curves | Bayesian priors / posteriors |
| Empirical probabilities & percentiles | Bayesian model comparison |
| Cleaning story (`-200`, NMHC drop, imputation) | Live city AQI APIs |
| Model methods: Persistence, Linear, Ridge, RF, HGB | Auth / MLOps |
| Guided “how we worked” story on dashboard | |

**Delivery surface:** New dashboard tab **Statistics** (`/statistics`). Insights stays for atmospheric EDA patterns.

---

## 2. Glossary (viva-ready)

| Term | Meaning in this project |
|------|-------------------------|
| **IQR** | Interquartile range = Q3 − Q1 |
| **Lower / left fence** | Q1 − 1.5 × IQR |
| **Upper / right fence** | Q3 + 1.5 × IQR |
| **Left / lower outliers** | Values &lt; lower fence |
| **Right / upper outliers** | Values &gt; upper fence |
| **Analytical outliers** | Flagged by IQR for discussion; **not** mass-deleted (pollution peaks can be real) |
| **Sentinel `-200`** | Hardware missing code — replaced with NaN (this *is* cleaned) |
| **Normal / bell curve** | Theoretical Normal(μ, σ²) PDF overlaid on histogram for comparison |
| **Empirical probability** | Fraction of hours meeting a rule, e.g. P(CO ≥ 4) |
| **Percentile (P90)** | Value below which 90% of observations fall |

---

## 3. Data cleaning (what we actually did)

1. Parse European CSV (`;` separator, `,` decimals).  
2. Build DateTime index; drop blank trailing rows / empty columns.  
3. Replace **`-200` → NaN** on all numeric sensors / GT columns.  
4. Drop **`NMHC(GT)`** (~90% missing).  
5. Time-aware linear interpolation for remaining continuous features.  
6. Create target **`CO_next = CO(GT).shift(-1)`**; drop last incomplete row.  
7. Chronological **70% / 15% / 15%** train / val / test (no random shuffle).

---

## 4. Models & methods used

| Method | Role |
|--------|------|
| Persistence baseline | `ŷ_{t+1} = CO(GT)_t` |
| Linear Regression (standardized) | Interpretable linear benchmark |
| Ridge Regression (α=10) | L2-regularized linear benchmark |
| Random Forest | Non-linear tree ensemble |
| **Tuned HistGradientBoosting** | Champion (TimeSeriesSplit-tuned) |

Metrics: RMSE, MAE, R² on chronological holdout. Source of truth: `artifacts/metrics.json`.

---

## 5. Statistics page chart inventory

| Section | Charts / widgets |
|---------|------------------|
| How we worked | Process timeline (Start → Clean → Explore → Model → Evaluate) |
| Data cleaning | Missingness bar chart (`/data/missingness`) |
| Outliers (IQR) | Fence KPIs + boxplot-style summary |
| Distribution | Histogram + normal PDF overlay |
| Probability | Percentile table + threshold probabilities |
| Models & methods | Method cards + RMSE comparison bars |

---

## 6. API endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /stats/distribution?variable=` | Histogram + moments + normal curve |
| `GET /stats/outliers?variable=` | IQR fences + left/right counts |
| `GET /stats/probabilities` | Percentiles + P(CO thresholds) |
| `GET /stats/methods-summary` | Cleaning steps + model table |
| `GET /data/missingness` | Reused for cleaning chart |

---

## 7. Outlier policy (say this in viva)

- Sensor **`-200`** values are invalid → cleaned to missing.  
- IQR extremes on cleaned CO are often **true high-pollution hours** → we **flag and interpret**, we do **not** delete them as “noise.”  
- That distinction is core Business Statistics judgment for environmental data.

---

## 8. Implementation checklist

- [x] This markdown plan  
- [x] Backend classical stats endpoints + tests  
- [x] Frontend Statistics tab (nav + page + client)  
- [x] Report section sync (outliers / distribution / probability)  
- [x] API tests + frontend build + teammate doc pointers  

---

*Classical Business Statistics only — no Bayesian modelling.*
