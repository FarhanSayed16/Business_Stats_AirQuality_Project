# AirWatch CO — 6-Member Presentation Script

**Duration target:** 10–12 minutes + Q&A  
**Members:** Member 1 … Member 6 (**assign real names yourselves**)  
**Laptop owner:** one person drives the dashboard; others speak standing.

**Live demo URLs (system is already deployed):**
- Dashboard: https://business-stats-air-quality-project.vercel.app  
- API: https://business-stats-airquality-project.onrender.com  

Open the **live** site before you start (not only localhost). Keep local as backup.

Assign names here before Wednesday:

| Seat | Real name | Focus |
|------|-----------|--------|
| Member 1 | _______________ | Intro + problem + target |
| Member 2 | _______________ | Data + cleaning + Explore |
| Member 3 | _______________ | Statistics (outliers / normal / probability) |
| Member 4 | _______________ | Insights EDA patterns |
| Member 5 | _______________ | Models + Predict live demo |
| Member 6 | _______________ | Evaluation + limits + close |

Related reading: [`PRESENTATION_TEAM_HANDBOOK.md`](PRESENTATION_TEAM_HANDBOOK.md) · [`DASHBOARD_WALKTHROUGH.md`](DASHBOARD_WALKTHROUGH.md)

---

## Stage setup (30 seconds before start)

1. Open **live** dashboard: https://business-stats-air-quality-project.vercel.app — on **Home**; **API ACTIVE** visible.  
2. If first load is slow, hit `/health` once and wait for Render wake-up.  
3. Browser zoom ~110% so charts read from back.  
4. Members know their order; no overlapping talk.  
5. Backup: local stack ([`RUN_LOCALLY.md`](RUN_LOCALLY.md)) or report HTML if Wi-Fi dies.

---

## Member 1 — Introduction & problem (≈ 1.5 min)

**Screen:** Home

> “Good morning professor and classmates. We are **Group 3**, and our project is **AirWatch CO**.
>
> Carbon Monoxide is a toxic roadside pollutant mainly from traffic. Our research question is:
> **Can we forecast next hour’s true CO using only current weather, sensors, and pollutant readings — without leaking future information?**
>
> Academically we built the full pipeline in **Python notebooks**. For demonstration we built this FastAPI + React dashboard so you can see cleaning, statistics, insights, and live prediction in one place.
>
> Our prediction target is **`CO_next` = next hour’s `CO(GT)`**. We will walk you through data, classical statistics, patterns, models, and limitations.”

**Handoff:** “Member 2 will start with the dataset and cleaning.”

---

## Member 2 — Dataset, cleaning, Explore (≈ 2 min)

**Screen:** Explore (then briefly Statistics → Data cleaning if helpful)

> “We used the **UCI Air Quality** hourly dataset from an Italian urban station, roughly March 2004 to April 2005 — about **9,353** cleaned modelling hours.
>
> The most important data issue: sensors mark invalid readings as **`-200`**, not blank. Treating `-200` as a real number would destroy means, correlations, and models. We replaced them with missing values.
>
> **`NMHC(GT)`** was about **90% missing**, so we **dropped** it instead of inventing data. Short gaps on other series were filled with **time-aware interpolation**.
>
> We then created the next-hour target and split data **chronologically** — **70% train, 15% validation, 15% test** — never random shuffle, because shuffling would leak future into past.
>
> On **Explore**, you can filter the cleaned table and see the missingness audit for this cleaning story.”

**Do once:** filter Test split or a rush hour.

**Handoff:** “Member 3 will cover classical Business Statistics — outliers, distributions, and probabilities.”

---

## Member 3 — Statistics lab (≈ 2–2.5 min)

**Screen:** Statistics (scroll sections 1 → 5)

> “This **Statistics** tab is our classical Business Statistics view.
>
> First, the process: Start → Clean → Explore → Model → Evaluate.
>
> For **outliers**, we use the IQR rule:
> lower fence = Q1 − 1.5×IQR, upper fence = Q3 + 1.5×IQR.
> Values below the lower fence are **left/lower outliers**; values above are **right/upper outliers**.
>
> Important judgment: many right-side CO outliers are **real pollution peaks**. We **flag** them for analysis; we do **not** delete them like we deleted invalid `-200` sentinels.
>
> Next, the **histogram with normal (bell) overlay**. CO is right-skewed, so the normal curve is a comparison tool for class discussion — we are **not** claiming CO is perfectly normal, and we did **not** use Bayesian regression.
>
> Finally, **empirical probabilities**: percentiles and the chance CO falls in our analytical tiers under 2, 2 to 4, or 4 and above. These are frequencies from cleaned data, not certified AQI labels.”

**Do once:** click another variable chip (e.g. Temperature) then return to CO.

**Handoff:** “Member 4 will show the atmospheric EDA patterns on Insights.”

---

## Member 4 — Insights / EDA (≈ 2 min)

**Screen:** Insights

> “On **Insights** we focus on patterns, not formulas.
>
> **Diurnal profile:** CO shows a **bimodal** day — morning rush around **8–9 AM** and evening rush around **6–8 PM**, with midday dilution and night trapping effects.
>
> **Weekly pattern:** weekdays stay higher; **Sunday** is the lull, which supports traffic as the main emission driver.
>
> **Weather coupling:** temperature, humidity, and absolute humidity relate to CO — meteorology modulates dispersion and sensor behavior.
>
> **Correlations:** CO moves strongly with benzene and NOx, and with key metal-oxide sensors such as PT08.S1 — useful predictive signals for the next-hour model.”

**Do once:** toggle weather scatter Temp → RH.

**Handoff:** “Member 5 will explain the models and run a live prediction.”

---

## Member 5 — Models + Predict Lab live demo (≈ 2.5 min)

**Screen:** Statistics section 6 briefly → Predict Lab

> “We compared five methods:
> **Persistence baseline**, **Linear Regression**, **Ridge**, **Random Forest**, and tuned **HistGradientBoosting**.
>
> Persistence already does well because CO is sticky hour-to-hour. Linear and Ridge improve a little. Tree models improve a lot.
>
> Our champion is **Tuned HistGradientBoosting** with holdout
> **RMSE 0.5378**, **MAE 0.3608**, **R² 0.8337** —
> about a **30.5% RMSE reduction** versus the baseline.
>
> Hyperparameters were tuned with **TimeSeriesSplit**, then scored on the untouched final test window.
>
> Now the live demo on **Predict Lab**…”

**Do live (must practice):**
1. Choose a holdout timestamp → run predict.  
2. Read predicted next CO, actual (if shown), absolute error.  
3. Optional: custom scenario — increase current CO / set evening hour → show forecast rise.

> “This forecast is served by the same saved model artifact from our notebooks — the dashboard is not a separate invented model.”

**Handoff:** “Member 6 will cover evaluation, usefulness, limitations, and close.”

---

## Member 6 — Evaluation, usefulness, limitations, close (≈ 2 min)

**Screen:** Evaluation → Team (optional) → stop

> “On **Evaluation**, the comparison table confirms HGB as champion. Feature importance typically highlights **current CO**, **hour cycle encodings**, and **PT08.S1**.
>
> Usefulness: a one-hour lead can support traffic timing decisions and short public-health advisories near busy roads.
>
> Limitations we accept honestly:
> 1. Extreme pollution spikes are **underestimated** — error rises in high CO tiers.  
> 2. The model is tied to **one Italian station** — not transferable without recalibration.  
> 3. Horizon is only **next hour**, not day-ahead.  
> 4. We lack direct traffic counts and wind direction.
>
> To conclude: AirWatch CO shows that careful cleaning, time-aware validation, classical statistics, and a tuned tree model can forecast next-hour CO without leakage — and the dashboard makes every step inspectable.
>
> Thank you. We welcome questions.”

---

## Q&A ownership (who answers what)

| Topic | Prefer |
|-------|--------|
| `-200`, NMHC drop, Explore table | Member 2 |
| IQR / normal curve / probabilities | Member 3 |
| Diurnal / Sunday / correlations | Member 4 |
| Models, metrics, Predict demo | Member 5 |
| Limitations, usefulness, Evaluation | Member 6 |
| Overall framing / “why this project” | Member 1 |
| Anyone unsure | Member 1 redirects to the right person |

---

## Timing card (print this)

| Member | Topic | Minutes |
|--------|-------|---------|
| 1 | Intro + problem | 1.5 |
| 2 | Data + cleaning | 2.0 |
| 3 | Statistics lab | 2.5 |
| 4 | Insights EDA | 2.0 |
| 5 | Models + live predict | 2.5 |
| 6 | Eval + limits + close | 2.0 |
| **Total** | | **≈ 12.5** (trim to 10 if needed) |

**If you must cut to 10 minutes:** shorten Member 4 weather/correlation; keep Member 5 live predict; keep Member 3 IQR + normal curve (professor-facing).

---

## Rehearsal checklist

- [ ] Names filled in the table at the top  
- [ ] Full dry run once with timer  
- [ ] Predict demo timestamp chosen in advance  
- [ ] One backup speaker if someone is late  
- [ ] Report PDF/HTML ready if asked for documents  

---

*Do not memorize word-for-word. Know your bullets, watch the screen, and speak naturally.*
