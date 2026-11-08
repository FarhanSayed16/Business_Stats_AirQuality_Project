# Enhancement Plan — Air Quality Web Dashboard  
## Group 3 | MCA I Statistics Internal Assessment  
### Making the project presentation-ready, complete, and class-impressive

**Document map:** [MASTER_PROJECT_PLAN.md](MASTER_PROJECT_PLAN.md) (phased execution) · [MASTER_EXECUTION_CHECKLIST.md](MASTER_EXECUTION_CHECKLIST.md) (daily checkboxes) · [PROJECT_IDEA_AND_EXECUTION_PLAN.md](PROJECT_IDEA_AND_EXECUTION_PLAN.md) (academic scope)

**Locked enhancement path:** FastAPI + React dashboard (**AirWatch CO**). Use the master plan/checklist for day-to-day execution.

---

## 0. Important Rule First (Do Not Break College Requirements)

Your official brief says:

> **All work must be carried out in Python only.**  
> Submit: **Python notebook/scripts + cleaned dataset + report**.

So this enhancement must be structured as **two layers**:

| Layer | Purpose | Technology | Status |
|-------|---------|------------|--------|
| **Core Academic Layer** | Marks / official submission | Python notebooks + cleaned CSV + PDF report | **Mandatory** |
| **Presentation Layer** | Class demo, professor wow-factor | Python API + React dashboard (or full Python Streamlit) | **Enhancement** |

**Never replace the notebook with only a website.**  
The dashboard *showcases* the same preprocessing, EDA, model, and metrics that already exist in Python. That way the project looks bigger and more complete, while still satisfying the internal assessment.

---

## 1. Vision — What We Are Building

A clean **Air Quality Intelligence Dashboard** that lets anyone (professor, classmates) explore the dataset, see pollution patterns, understand weather relationships, and try a **next-hour CO(GT) prediction** live — without opening a Jupyter notebook.

### One-line pitch for class
> “We cleaned and analysed the UCI Air Quality data in Python, built a next-hour CO prediction model with proper evaluation, and packaged the insights into a live web dashboard for monitoring-style exploration.”

### What “complete” means for your professor
Not a huge product. A **tight, polished end-to-end story**:

1. Data understood & cleaned  
2. Patterns discovered (EDA)  
3. Model built, tuned, evaluated  
4. Insights + limitations explained  
5. Same work visible interactively in a web app  
6. Deployed URL ready for viva/demo  

---

## 2. What Should Be In the Web App (Screen-by-Screen)

Keep it to **5–6 pages**. Enough to look professional; not so many that you cannot finish.

### Page 1 — Overview / Home
**Goal:** Instant project understanding.

Show:
- Project title, group name, objective in 2–3 lines  
- Key KPIs (cards):
  - Total hours analysed  
  - Date range covered  
  - Average / max CO(GT)  
  - Best model name + Test RMSE / MAE / R²  
- Short “How to use this dashboard” strip  
- CTA buttons: Explore Data | View Insights | Try Prediction  

**Why it impresses:** Professor sees the whole project in 10 seconds.

---

### Page 2 — Dataset Explorer
**Goal:** Prove you understand the data.

Show:
- Filterable table of cleaned hourly records (date range, hour, pollutant filters)  
- Column dictionary (hover/tooltip meanings of `CO(GT)`, sensors, `T`, `RH`, `AH`)  
- Missingness summary (before vs after cleaning; mention `-200` handling)  
- Download cleaned CSV button  

**Interactions:**
- Date range picker  
- Search / filter by hour-of-day  
- Toggle raw vs cleaned sample  

---

### Page 3 — Exploratory Analysis (Insights)
**Goal:** Show statistics work visually.

Sections / charts:
1. **CO over time** (line chart; zoomable)  
2. **Hour-of-day pattern** (average CO by hour — traffic peak story)  
3. **Day-of-week pattern**  
4. **Weather vs pollution** (scatter: T/RH/AH vs CO)  
5. **Correlation heatmap** (pollutants, sensors, weather)  
6. **Distribution / boxplots** for key variables  

Optional small insight cards under each chart:
- “CO peaks around evening rush hours…”  
- “Higher humidity associated with …” (only if your EDA supports it)

**Why it impresses:** This is your EDA requirement, but demo-friendly.

---

### Page 4 — Model Lab (Predict Next-Hour CO)
**Goal:** Live demonstration of the predictive objective.

Show:
- Short explanation: “Model uses only information available up to current hour.”  
- Input panel (sliders / number fields) for key features, e.g.:
  - Current `CO(GT)`  
  - Temperature, RH, AH  
  - Key sensor values (or a “pick a historical hour” mode)  
- **Predict** button → shows predicted next-hour CO  
- Confidence / uncertainty band if feasible (optional)  
- Side panel: model type, tuned hyperparameters, train/test period  

Better (and safer) demo mode:
- **“Select a past timestamp”** → auto-fill features from cleaned data → predict → compare with actual next-hour CO  
- This avoids fake manual inputs and proves evaluation honesty.

Show:
- Actual vs Predicted chart on test set  
- Residual plot  
- Metrics table (Baseline vs Linear vs Tuned best model)

---

### Page 5 — Evaluation & Limitations
**Goal:** Academic maturity (professors love this).

Show:
- Metric comparison table  
- When the model fails (high-pollution hours / night hours / missing-sensor periods)  
- Usefulness for monitoring (early warning, sensor support)  
- Limitations (single station, old period, missing `-200` values, no external traffic/events data, next-hour only)  
- Ethical / practical note: predictions assist monitoring, do not replace reference analyzers  

---

### Page 6 — About / Team
Show:
- Group 3 members + roles  
- Tech stack badges  
- Link to report / notebook (optional)  
- Contribution summary matching the report  

---

## 3. What Should NOT Be In the Web App (Avoid Scope Creep)

Do **not** build these for a 21-day class project:

- User login / multi-tenant accounts  
- Real-time live city API integration (unless leftover time)  
- Mobile native apps  
- Complex GIS maps of Italy (optional tiny map is fine; not required)  
- Auto-retraining MLOps pipelines  
- Too many ML models (2–3 is enough)  
- Chatbot / AI assistant gimmicks  

**Principle:** Every page must map to a required academic task.

---

## 4. Two Technical Paths (Choose One)

### Path A — Fastest & Fully Python (Safest for “Python only”)
**Stack:** Streamlit or Dash + Plotly + scikit-learn  

| Pros | Cons |
|------|------|
| Entirely Python (easy to defend in viva) | UI less “product-like” than React |
| Fast to build (3–5 days after modelling) | Custom design is limited |
| Easy deploy (Streamlit Community Cloud) | |

**Best if:** You are short on time or professor is strict on Python-only.

---

### Path B — Recommended for Class Impact (Python + React)
**Stack:**

| Layer | Choice | Why |
|-------|--------|-----|
| Data / ML | Python (`pandas`, `scikit-learn`, `joblib`) | Core academic work |
| API | **FastAPI** | Serves cleaned data, chart aggregates, predictions |
| Frontend | **React + Vite + TypeScript** | Clean modern dashboard |
| Charts | Recharts / Chart.js / ECharts | Interactive visuals |
| UI | Tailwind + simple layout (not over-designed) | Fast, readable on projector |
| Model artifact | `model.joblib` + `metrics.json` + `cleaned.csv` | Reproducible demo |
| Deploy | Frontend on **Vercel**; API on **Render / Railway / Fly.io** | Free-tier friendly |

**Best if:** You want the professor to see a complete “analysis + productized insight” project.

> Viva answer if asked about Python-only:  
> “All statistical analysis, preprocessing, modelling and evaluation were done in Python. The React app is only a presentation interface calling our Python API.”

---

## 5. Recommended Architecture (Path B)

```text
┌──────────────────────────────┐
│  React Dashboard (Vercel)    │
│  Pages: Home, Explore, EDA,  │
│  Predict, Evaluation, Team   │
└──────────────┬───────────────┘
               │ REST / JSON
┌──────────────▼───────────────┐
│  FastAPI (Python backend)    │
│  /health                     │
│  /meta                       │
│  /data (filtered rows)       │
│  /stats/overview             │
│  /stats/timeseries           │
│  /stats/correlation          │
│  /stats/hourly-pattern       │
│  /model/info                 │
│  /model/predict              │
│  /model/evaluation           │
└──────────────┬───────────────┘
               │
     ┌─────────▼──────────┐
     │ cleaned_air_quality│
     │ model.joblib       │
     │ metrics.json       │
     │ feature_schema.json│
     └────────────────────┘
```

### Same source of truth
Notebooks train the model → export artifacts → API loads artifacts → React displays them.  
No duplicate “fake” numbers in the frontend.

---

## 6. Feature Priority (Must / Should / Nice)

### Must Have (for a strong class demo)
1. Overview KPIs + best model metrics  
2. Time-series CO chart with date filter  
3. Correlation heatmap + hour-of-day pattern  
4. Predict page with historical timestamp compare (actual vs predicted)  
5. Evaluation + limitations page  
6. Deployed public URL  

### Should Have
1. Dataset explorer table  
2. Weather vs CO scatter with selectable weather variable  
3. Model comparison cards (Baseline / Linear / Tuned)  
4. Missingness before/after cleaning visual  

### Nice to Have (only if time left)
1. Dark/light theme toggle  
2. Export chart as PNG  
3. Simple “AQI-style” CO severity badge (Low/Moderate/High) based on thresholds you define and justify  
4. Short recorded demo video for backup if Wi-Fi fails  

---

## 7. Enhanced Project Folder Structure

```text
Business_Stats_AirQuality_Project/
├── dataset/                      # original UCI files
├── data/
│   └── cleaned/                  # cleaned_air_quality.csv
├── notebooks/
│   ├── 01_preprocessing.ipynb
│   ├── 02_eda.ipynb
│   ├── 03_modelling.ipynb
│   └── 04_tuning_evaluation.ipynb
├── artifacts/
│   ├── model.joblib
│   ├── metrics.json
│   └── feature_schema.json
├── backend/                      # FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   ├── services/
│   │   └── schemas/
│   └── requirements.txt
├── frontend/                     # React + Vite
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/
│   │   └── styles/
│   └── package.json
├── reports/
│   └── Group3_AirQuality_Report.pdf
├── docs/
│   ├── PROJECT_IDEA_AND_EXECUTION_PLAN.md
│   └── ENHANCEMENT_WEB_DASHBOARD_PLAN.md
└── README.md
```

---

## 8. How the Whole Thing Should Work (End-to-End Flow)

### Offline academic flow (marks)
1. Load raw UCI data in Python  
2. Clean `-200`, impute, engineer lags/calendar features  
3. EDA → save key figures  
4. Train/compare/tune models with time-aware split  
5. Export cleaned data + model + metrics  
6. Write report (approach, findings, limitations, contributions)

### Online demo flow (class presentation)
1. Professor opens deployed dashboard URL  
2. Home page shows objective + final metrics  
3. Explore page proves cleaned data exists  
4. Insights page walks through EDA story  
5. Predict page: pick a test timestamp → show predicted vs actual next-hour CO  
6. Evaluation page: honesty about errors and limits  
7. Team page: who did what  

### Prediction request flow (technical)
1. React sends feature payload OR timestamp id to `/model/predict`  
2. FastAPI validates schema  
3. Model loads features in correct order  
4. Returns `{ predicted_co, actual_co? , model_name, timestamp }`  
5. UI renders result + optional error vs actual  

---

## 9. Revised 21-Day Plan (Core + Dashboard Together)

> Keep official stats work first. Dashboard starts once model metrics exist.

| Days | Focus | Output |
|------|--------|--------|
| **1–2** | Setup, data understanding, repo structure | Env + data notes |
| **3–5** | Preprocessing + cleaned dataset | `cleaned_air_quality.csv` |
| **6–9** | EDA + insight notes + chart specs for UI | EDA notebook + figure list |
| **10–14** | Models + evaluation | Candidate model + metrics |
| **15–16** | Hyperparameter tuning + final test results | `model.joblib`, `metrics.json` |
| **17–18** | FastAPI endpoints + wire to artifacts | Working local API |
| **19** | React pages (Home, Insights, Predict, Evaluation) | Local full demo |
| **20** | Deploy frontend + backend; fix bugs; polish UI | Live URL |
| **21** | Report finalization + presentation rehearsal | Submission + demo ready |

### Parallel team split (ideal)
| Member | Track |
|--------|--------|
| A | Preprocessing + cleaned data + API data endpoints |
| B | EDA + Insights page charts/content |
| C | Modelling/tuning + Predict/Evaluation API |
| D | React UI + deployment + report assembly |

---

## 10. Presentation Plan for Class (8–10 Minutes)

| Time | Segment | Who | What you show |
|------|---------|-----|---------------|
| 0:00–1:00 | Hook | Any | “Can we predict next-hour CO from current conditions?” open dashboard Home |
| 1:00–2:30 | Data | A | Dataset Explorer + `-200` missingness story |
| 2:30–5:00 | Insights | B | Time pattern + correlation + weather link |
| 5:00–7:30 | Model | C | Predict page live demo + metrics vs baseline |
| 7:30–9:00 | Honesty | D | Limitations + monitoring usefulness |
| 9:00–10:00 | Close | All | Team roles + Q&A |

### Backup if internet fails
- Localhost demo on one laptop  
- OR recorded 2-minute screen capture  
- OR static screenshots in slides + notebook fallback  

---

## 11. What Makes This Look “More Complete” to a Professor

| Ordinary submission | Your enhanced submission |
|---------------------|--------------------------|
| Notebook only | Notebook + interactive dashboard |
| Static plots | Filterable live charts |
| “Model accuracy = X” text | Live predict vs actual on test hours |
| Methods buried in cells | Clear pages mapped to required tasks |
| No deployment | Shareable URL for viva |
| Weak story | Full narrative: clean → explore → predict → limit |

You are not making it “enterprise large.”  
You are making it **end-to-end, demoable, and academically solid**.

---

## 12. UI / Design Direction (Keep Simple, Look Premium)

For class projectors and viva:
- Light theme, high contrast, large chart fonts  
- One accent color (e.g. teal/slate — avoid generic purple AI look)  
- Max 3 KPI cards on Home  
- One chart focus per section  
- Clear labels: units (`mg/m³`, °C, %) always visible  
- Mobile optional; **desktop-first** for presentation  

Suggested app name options:
- **AirWatch CO**  
- **ClearHour** (next-hour CO insight)  
- **AquaStat Air Quality Lab**  

Pick one and keep branding consistent on Home + report cover.

---

## 13. Deployment Plan (Practical)

### Recommended free setup
1. **Backend (FastAPI)** → Render / Railway  
   - Include `cleaned` data + model artifacts in deploy bundle or cloud storage  
2. **Frontend (React)** → Vercel  
   - Set `VITE_API_URL` to backend URL  
3. Enable CORS on FastAPI for the Vercel domain  
4. Add health check route and a simple “API status” badge on Home  

### Pre-demo checklist
- [ ] Home KPIs load  
- [ ] Charts load under 3–4 seconds  
- [ ] Predict works for at least 5 sample timestamps  
- [ ] Metrics match notebook numbers  
- [ ] Limitations page readable  
- [ ] URL opens on professor’s phone/laptop  

---

## 14. Submission Package (Academic + Enhancement)

### Must submit (official)
- Python notebooks/scripts  
- Cleaned dataset  
- Report (approach, findings, results, limitations, contributions)

### Also prepare (enhancement)
- Deployed dashboard URL  
- `README.md` with run instructions  
- Screenshots appendix in report (“Interactive Dashboard”)  
- Optional short architecture diagram  

In the report, add one short section:

> **Enhancement: Interactive Dashboard**  
> To support interpretation and demonstration, we deployed a web dashboard that visualises EDA findings and serves the trained next-hour CO model through a Python API. Core analysis remains fully reproducible in the submitted notebooks.

---

## 15. Risks & How We Avoid Them

| Risk | Mitigation |
|------|------------|
| Dashboard eats modelling time | Freeze model by Day 16; UI uses exported artifacts only |
| Python-only policy concern | Keep notebooks as primary; call React a presentation layer |
| Deployment breaks on demo day | Local backup + video + screenshots |
| Metric mismatch web vs notebook | Single `metrics.json` source of truth |
| Too many features unfinished | Ship Must-Have pages only; hide Nice-to-Have |

---

## 16. Decision to Lock Now

**Locked for Group 3:**

1. **Core:** Python notebooks for preprocessing, EDA, modelling, tuning (marks).  
2. **Enhancement:** FastAPI + React dashboard (**AirWatch CO**) with 6 pages (Home, Explore, Insights, Predict, Evaluation, Team).  
3. **Hero demo:** historical timestamp → next-hour CO predict vs actual.  
4. **Deploy:** Vercel (frontend) + Render (API).  
5. **Scale:** class-presentation complete — not enterprise.  
6. **Execution source of truth:** [MASTER_PROJECT_PLAN.md](MASTER_PROJECT_PLAN.md) + [MASTER_EXECUTION_CHECKLIST.md](MASTER_EXECUTION_CHECKLIST.md).

---

## 17. Immediate Next Actions

1. Open [MASTER_EXECUTION_CHECKLIST.md](MASTER_EXECUTION_CHECKLIST.md) and start **Phase 1**.  
2. Assign dashboard page owners from the master plan team table.  
3. Finish core Phases 1–6 before rich UI work.  
4. Create `backend/` and `frontend/` skeletons once `metrics.json` exists (Phases 7–9).

---

## 18. Status Note

The FastAPI + React AirWatch CO dashboard described in this plan is **implemented in the repository** (local demo via `start_project.bat` / `start_project.ps1`). Cloud deploy (Vercel + Render) remains optional and needs host account credentials. For teammate-facing status, decisions, and run instructions, use [TEAM_PROJECT_BRIEF.md](TEAM_PROJECT_BRIEF.md) and [SYSTEM_AND_DECISIONS.md](SYSTEM_AND_DECISIONS.md).

---

*This enhancement makes Group 3’s Air Quality project demoable for class/viva without replacing the official Statistics IA Python deliverables.*
