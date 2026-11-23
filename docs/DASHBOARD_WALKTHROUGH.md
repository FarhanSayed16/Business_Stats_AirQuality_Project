# AirWatch CO — Dashboard Walkthrough (for Wednesday)

### Live system (use this on Wednesday)

| | URL |
|--|-----|
| **Dashboard** | https://business-stats-air-quality-project.vercel.app |
| **API** | https://business-stats-airquality-project.onrender.com |
| **Health** | https://business-stats-airquality-project.onrender.com/health |

Navbar should show **API ACTIVE**. If the first load is slow, wait once — Render free tier may be waking up.

### Local backup (only if live fails)

| | URL |
|--|-----|
| Dashboard | http://localhost:5173 |
| API | http://localhost:8000 |

Use this while clicking. Each section = one tab.

Companion docs: [`PRESENTATION_TEAM_HANDBOOK.md`](PRESENTATION_TEAM_HANDBOOK.md) · [`PRESENTATION_SCRIPT_6_MEMBERS.md`](PRESENTATION_SCRIPT_6_MEMBERS.md)

---

## Demo order (recommended)

**Home → Explore → Statistics → Insights → Predict → Evaluation → Team**

Total click-through: ~8–12 minutes with talking.

---

## 1. Home

**What you see**
- Project title / story
- KPI pods (temp, humidity, sensor, mean CO)
- CO concentration gauge
- Champion model snapshot (R², RMSE gain)

**What to say**
- This is AirWatch CO — next-hour CO prediction without leakage.
- Numbers come from cleaned data + `metrics.json`, not fake UI stats.

**Point at**
- Mean CO gauge  
- Test R² ≈ **0.83** / RMSE improvement ≈ **30.5%**

---

## 2. Explore

**What you see**
- Filterable cleaned table (split / date / hour / search)
- Missingness summary for `-200` audit
- Download cleaned CSV

**What to say**
- This is the **cleaned** dataset after sentinel treatment.
- `-200` was hardware missing — not a real concentration.
- `NMHC(GT)` was ~90% missing → dropped.

**Do live**
- Filter **Holdout Test** or hour **18** once so audience sees interactivity.

---

## 3. Statistics (Business Statistics lab)

**What you see (scroll sections)**
1. How we worked (5 steps)  
2. Data cleaning + missingness chart  
3. IQR outliers (left/right fences)  
4. Histogram + **normal (bell) overlay**  
5. Empirical probabilities / percentiles / CDF  
6. Models & methods comparison  

**What to say**
- This tab is for classical Business Statistics concepts the professor expects.
- **IQR:** lower fence = Q1−1.5×IQR; upper = Q3+1.5×IQR.  
- Left outliers = below lower; right = above upper.  
- For CO, many **right outliers are real peaks** — we flag, we don’t blindly delete.  
- Bell curve overlay compares to Normal(μ,σ); CO is skewed.  
- Probabilities are **empirical frequencies**, not Bayesian.

**Do live**
- Switch variable chips (CO → T or RH) to show IQR/distribution update.
- Point to champion card on section 6.

---

## 4. Insights (EDA patterns)

**What you see**
- Diurnal (hour-of-day) mean with IQR band  
- Weekday pattern  
- Weather vs CO scatter (T / RH / AH toggle)  
- Correlation matrix  
- Timeseries sample  

**What to say**
- **Bimodal day:** morning ~8–9 AM and evening ~6–8 PM rush hours.  
- **Sunday lull:** traffic drops → CO drops.  
- Sensors / benzene / NOx move with CO (co-emission + sensor proxies).

**Do live**
- Toggle weather variable once (Temp → RH).

---

## 5. Predict Lab

**What you see**
- Replay a holdout timestamp **or** custom scenario sliders  
- Predicted next-hour CO + optional actual / error  

**What to say**
- This uses the **same champion model** (`model.joblib`) the notebooks exported.
- Replay mode proves we’re not inventing numbers — we can compare to actual holdout.

**Do live**
1. Pick a sample timestamp → Predict.  
2. Read predicted vs actual and absolute error.  
3. (Optional) Custom: raise current CO / evening hour → forecast rises.

---

## 6. Evaluation

**What you see**
- Full model comparison table  
- Feature importance  
- Actual vs predicted series  
- Error by pollution tier  

**What to say**
- Persistence was already decent; trees beat linear; **HGB wins**.  
- Top drivers usually: current CO, hour cycles, PT08.S1.  
- Errors grow on **high pollution tiers** — honest limitation.

**Point at**
- Champion row metrics  
- High-tier MAE/RMSE increase  

---

## 7. Team

**What you see**
- Six member cards + roles  
- Architecture / stack / report links  

**What to say**
- Brief credits; invite Q&A.  
- Report HTML/PDF links if professor asks for documents.

---

## Graph cheat-sheet (one line each)

| Chart | Meaning |
|-------|---------|
| Missingness bars | How bad `-200` was; NMHC dropped |
| IQR fence bars | Quartiles + outlier fences |
| Histogram + line | Shape of CO vs normal overlay |
| CDF / percentiles | Probability language |
| Hourly IQR band | Rush-hour rhythm |
| Weekday pattern | Sunday traffic lull |
| Weather scatter | CO vs meteorology |
| Correlation | Who moves with whom |
| RMSE bars | Which model is best |
| Actual vs predicted | Holdout fidelity |
| Error by tier | Where model fails |

---

## If something breaks live

| Symptom | Fix |
|---------|-----|
| API OFFLINE on Vercel | Open health URL; wait 30–60s for Render wake-up; hard refresh dashboard |
| Blank charts | Hard refresh; confirm API ACTIVE |
| Predict fails | Retry once after API is warm; fallback to local stack |
| Whole cloud down | Switch to local: [`RUN_LOCALLY.md`](RUN_LOCALLY.md) |

---

*Practice this click path once with a timer. Don’t read every sentence — point and explain.*
