# System Audit & Enhancement Plan — AirWatch CO  
## Group 3 | MCA I Statistics Internal Assessment  
### Historical audit against [MASTER_PROJECT_PLAN.md](MASTER_PROJECT_PLAN.md)

**Original audit date:** 2026-03-08  
**Status note (current):** Prefer [TEAM_PROJECT_BRIEF.md](TEAM_PROJECT_BRIEF.md) and [SYSTEM_AND_DECISIONS.md](SYSTEM_AND_DECISIONS.md) for live teammate status. Most Wave A–D fixes below were **completed** afterward (Render start path, CORS allow-list, metrics/missingness from artifacts, PDF report, glass UI). Remaining open items are mainly **Member B/C legal names** and **optional cloud deploy**.

**Original scope:** Repo structure, academic notebooks/artifacts, FastAPI backend, React dashboard, reports, deployment configs, checklist honesty  
**Method:** Code review + cleaned-data validation + `test_backend_api.py` run + `npm run build` + metric/artifact parity checks  

**Related docs:** [TEAM_PROJECT_BRIEF.md](TEAM_PROJECT_BRIEF.md) · [MASTER_EXECUTION_CHECKLIST.md](MASTER_EXECUTION_CHECKLIST.md) · [PROJECT_IDEA_AND_EXECUTION_PLAN.md](PROJECT_IDEA_AND_EXECUTION_PLAN.md) · [ENHANCEMENT_WEB_DASHBOARD_PLAN.md](ENHANCEMENT_WEB_DASHBOARD_PLAN.md)

---

## 1. Executive verdict *(as of original audit — many items since closed)*

| Area | Status at audit | Score (approx.) |
|------|--------|-----------------|
| Academic core (preprocess → EDA → model → tune) | Strong | 90% |
| Artifacts + cleaned data | Strong | 95% |
| FastAPI backend (local) | Strong | 90% |
| React dashboard (local feature coverage) | Good, with gaps | 80% |
| Integration / error UX / metric honesty | Needs work | 65% |
| Production deployment readiness | **Not ready** | 40% |
| College report / viva pack | Good (HTML/MD; PDF added later) | 85% |
| Checklist accuracy vs reality | Over-marked on Phases 11–12 | — |

**Bottom line (audit-time):** The project was **locally demoable and academically substantial**. Backend tests passed. Cleaned data and `model.joblib` were valid. Dashboard pages existed.

It was **not fully complete** against the master plan’s Must-Haves at audit time, mainly because:

1. Production deploy configs were **incorrect** and would fail on Render as written *(later fixed via root `Procfile` + `render.yaml`)*.  
2. Several Must-Have UI pieces are missing or only partially done (full CO timeseries on Insights; date filters on Explore; real user-facing error states).  
3. Documentation / UI / `metrics.json` **drift** (Ridge & Random Forest claimed in README/report but absent from API metrics).  
4. The master checklist is marked fully done, including production smoke tests that are **not evidenced by live URLs**.  
5. Some Home KPIs are **hardcoded**, and missingness is **hardcoded** in the API instead of derived from data.

Use this file as the **fix backlog**. Do not start random new features until P0–P1 items below are closed.

---

## 2. What is already working well (keep)

### Academic / data layer
- All four notebooks present: `01_preprocessing`, `02_eda`, `03_modelling`, `04_tuning_evaluation`
- Cleaned dataset: `data/cleaned/cleaned_air_quality.csv` — **9,353 rows**, **35 columns**, **no `-200` left**, splits `train=6547 / val=1403 / test=1403`, `CO_next` has 0 NaNs
- Artifacts present and loadable:
  - `artifacts/model.joblib` → `HistGradientBoostingRegressor`
  - `artifacts/metrics.json` → primary test RMSE **0.5378**, MAE **0.3608**, R² **0.8337**
  - `artifacts/feature_schema.json` → **28 features**
- Figures 01–10 + UI screenshots exist under `figures/`
- Target definition and anti-leakage story are correctly framed in notebooks/docs

### Backend (local)
- `python test_backend_api.py` → **ALL TESTS PASSED**
- Endpoints live: `/health`, `/meta`, `/stats/*`, `/data*`, `/model/*`
- Timestamp predict works (sample abs error observed in test run)
- Custom feature predict works
- Evaluation payload includes comparison, feature importance, error tiers, actual-vs-predicted series

### Frontend (local)
- Six pages exist: Home, Explore, Insights, Predict, Evaluation, Team
- Tailwind + Recharts + health badge in Navbar
- `npm run build` succeeds (TypeScript clean; chunk-size warning only)
- `frontend/dist` present; 1-click `start_project.ps1` / `.bat` launch local stack correctly via `uvicorn backend.app.main:app`

### Submission support
- Report MD + HTML, viva script/Q&A, usefulness/limitations docs, README architecture narrative

---

## 3. Gap register (prioritized)

Severity key:
- **P0 — Critical:** blocks deploy, breaks demo, or creates false academic claims  
- **P1 — High:** master-plan Must-Have incomplete  
- **P2 — Medium:** accuracy, honesty, maintainability, presentation quality  
- **P3 — Low:** polish / nice-to-have  

---

### P0 — Critical

#### P0.1 Broken Render / Procfile startup path
**Evidence**
- [`render.yaml`](../render.yaml): `startCommand: "cd backend && uvicorn app.main:app ..."`
- [`backend/Procfile`](../backend/Procfile): `uvicorn app.main:app ...`
- [`backend/app/main.py`](../backend/app/main.py) imports `from backend.app.routers import ...`

**Problem:** App package expects project **root** as working directory (`backend.app...`). Starting inside `backend/` as `app.main:app` will fail imports and/or fail to find `data/cleaned` + `artifacts` (DataService searches relative paths from CWD).

**Local works because** `start_project.ps1` correctly runs:
`uvicorn backend.app.main:app --reload --port 8000` from repo root.

**Fix**
1. Change production start to root-based:
   - `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
2. Align `render.yaml` + `Procfile` (or move Procfile to repo root).
3. Ensure cleaned CSV + artifacts are included in deploy bundle / build.
4. Smoke-test `/health` on the real Render URL before ticking Phase 12 again.

#### P0.2 Checklist over-claims production readiness
**Evidence:** [MASTER_EXECUTION_CHECKLIST.md](MASTER_EXECUTION_CHECKLIST.md) Phase 12 marks production smoke test, live health, and DoD as done, but repo contains **configs only**, no verified public URLs in README/Team page.

**Fix**
1. Untick / annotate Phase 12 items that are “prepared but not live”.
2. After real deploy, record URLs in README + Team page.
3. Re-run production smoke checklist honestly.

#### P0.3 CORS config is unsafe / may fail browsers
**Evidence:** `allow_origins=["*"]` with `allow_credentials=True` in [`backend/app/main.py`](../backend/app/main.py).

**Problem:** Browsers reject credentialed requests with wildcard origins. Even if credentials unused today, this is fragile for Vercel→Render.

**Fix:** Explicit allow-list:
- `http://localhost:5173`
- production Vercel domain(s)
- optional `allow_credentials=False` if not needed

---

### P1 — High (master-plan Must-Have gaps)

#### P1.1 Insights page missing full CO timeseries chart
**Plan requirement:** Insights Must-Have includes **CO over time** (zoomable/filterable).  
**Current:** Insights has hourly pattern, weekday, weather scatter, correlation table — **no call to `api.getTimeseries()`** even though client + backend support it.

**Fix:** Add timeseries section (with step/date controls) on Insights (or Home). Prefer API-driven data, not static PNGs only.

#### P1.2 Explore page missing date-range filters
**Plan requirement:** date range picker + hour filter.  
**Current:** hour / split / search only; `start_date`/`end_date` API params unused in UI.

**Fix:** Add start/end date inputs wired to `api.getDataRows(...)`.

#### P1.3 User-facing error / empty states incomplete
**Plan Phase 11:** API-down, empty filters, predict failure must show clear UI.  
**Current:** Most pages `console.error` and leave blank/loading forever (Home, Insights, Evaluation, Predict catch paths).

**Checklist falsely marks these done.**

**Fix:** Shared `ErrorState` / `EmptyState` components; show retry CTA; Navbar already has health badge — pages should degrade gracefully when offline.

#### P1.4 Home hardcodes weather / sensor KPI pods
**Evidence:** Home shows `18.3°C`, `48.9%` as literals, not from `/stats/overview`.

**Problem:** Looks like live telemetry but is static; undermines “single source of truth”.

**Fix:** Either:
- compute mean T/RH/AH (and optional sensor means) in `/stats/overview` and bind UI, **or**
- clearly label as “dataset annual mean (static summary)”.

Prefer API-driven values.

#### P1.5 Missingness endpoint is hardcoded, not computed
**Evidence:** `DataService.get_missingness_summary()` returns a fixed Python list.

**Problem:** If cleaning pipeline changes, Explore “before/after” story can lie.

**Fix:** Persist missingness JSON from preprocessing notebook into `artifacts/` (e.g. `missingness.json`) and serve that; or compute from a raw-vs-cleaned comparison script.

#### P1.6 Model comparison drift across README / report / API / UI
**Evidence**
- README + report include **Ridge** and **Random Forest** test metrics.
- `artifacts/metrics.json` only has: Persistence, Linear_Regression, Tuned_HistGradientBoosting.
- Evaluation UI only renders those three.

**Problem:** Professor can ask “show Ridge/RF in the dashboard” and numbers won’t appear; or ask why report and API disagree.

**Fix (pick one and apply everywhere):**
- **Preferred:** Re-export `metrics.json` with Ridge + RF (and optionally Baseline) from notebooks/`export_final_artifacts.py`, then update Evaluation UI to render all keys dynamically.
- **Alternative:** Remove Ridge/RF from README/report if they are not part of the official comparison artifact.

---

### P2 — Medium

#### P2.1 Custom “what-if” predict invents lags
`predict_custom_features()` copies current CO into lag1/2/3/rolling when not provided. Acceptable for demo only if labeled as **simulation approximation**, not historical truth.

**Fix:** UI disclaimer on custom mode; keep historical timestamp mode as the viva-primary demo.

#### P2.2 CO “WHO / Good Air Quality” severity badges overclaim
Predict/Home severity labels imply health guideline mapping without cited thresholds in academic report.

**Fix:** Relabel as **project-defined pollution tiers** (Low &lt;2, Moderate 2–4, High &gt;4) matching `error_by_pollution_tier` in metrics — cite that these are analytical bins, not certified AQI.

#### P2.3 No formal PDF report
College often expects PDF/DOC. You have MD + HTML printable report.

**Fix:** Export HTML → PDF (browser print or script) into `reports/AIRWATCH_CO_FINAL_STATISTICS_REPORT.pdf`.

#### P2.4 Team page uses placeholder member names
Only “Farhan Sayed” is real; others are “Group 3 Analytics/Modelling Specialist”.

**Fix:** Replace with real names/roles before submission; keep aligned with report contributions.

#### P2.5 Production URLs not on Team/README
Plan requires shareable URL documentation.

**Fix:** After deploy, add API + dashboard URLs.

#### P2.6 Frontend bundle size warning
`npm run build` warns chunk &gt; 500 kB.

**Fix (optional before demo):** route-level code splitting (`React.lazy`) for Insights/Evaluation/Predict.

#### P2.7 SPA catch-all when serving `frontend/dist` from FastAPI
`main.py` registers `/{full_path:path}` after routers — usually OK, but brittle if a new unprefixed route is added later.

**Fix:** Document that API routes must be registered before SPA fallback; consider mounting SPA only under non-API paths more explicitly.

#### P2.8 Evaluation / Home loading UX
Evaluation shows “Loading…” inside table cells forever if API fails; Home sets `loading=false` on error but leaves empty metrics.

**Fix:** Explicit error banners.

#### P2.9 Test suite does not assert metric parity
`test_backend_api.py` checks shapes/keys, not that overview RMSE equals `metrics.json` primary values.

**Fix:** Add assertions:
- `primary_model.test_rmse == metrics.json`
- predict on fixed timestamp matches notebook/joblib within tolerance

#### P2.10 `export_final_artifacts.py` vs notebook dual sources
Artifacts can be regenerated from script OR notebook. Risk of silent divergence.

**Fix:** Document canonical regeneration path in README (“run notebook 04 OR `export_final_artifacts.py`”) and prefer one official path.

---

### P3 — Low / Nice-to-have

- Theme toggle, chart PNG export  
- True map visualization  
- Demo video backup (still useful for viva Wi-Fi failure)  
- Dynamic import / performance polish  
- Stricter TypeScript typing for `/meta` (`any` in client)

---

## 4. Phase-by-phase compliance snapshot

| Phase | Master-plan intent | Audit result |
|------:|--------------------|--------------|
| 1 Environment | Skeleton, venv, README | **Done** |
| 2 Data understanding | Docs + target freeze | **Done** (`docs/DATA_UNDERSTANDING.md`) |
| 3 Preprocessing | Cleaned CSV + notebook | **Done** (validated) |
| 4 EDA | Notebook + figures + insights | **Mostly done**; Insights UI missing full timeseries |
| 5 Modelling | Baseline + models | **Done** in notebooks; artifact comparison incomplete vs report |
| 6 Tuning + artifacts | joblib/metrics/schema | **Done** (validated load/predict) |
| 7 API foundation | health/meta/CORS | **Local done**; CORS needs harden |
| 8 Domain endpoints | stats/data/model | **Done** (tests pass) |
| 9 Frontend foundation | routes, client, badge | **Done** |
| 10 Feature pages | 6 pages Must-Haves | **Partial** (see P1.1–P1.4) |
| 11 Hardening | parity, errors, dry-run | **Partial** (errors weak; checklist overstated) |
| 12 Deployment | live URL | **Not truly done** (P0.1–P0.2) |
| 13 Report + presentation | report + script | **Mostly done**; PDF + real names pending |

---

## 5. Accuracy & integrity findings

### Confirmed accurate
- Cleaned row count **9353** matches API `/meta` and tests  
- Primary metrics in UI Evaluation/Home match `metrics.json` when API online  
- No `-200` remains in cleaned numerics  
- Chronological split sizes match metrics.json  

### Integrity risks to fix
1. Report/README model table ≠ `metrics.json` model set  
2. Hardcoded missingness + hardcoded Home weather pods  
3. Health/severity wording overclaims regulatory meaning  
4. Checklist marks Phase 11–12 complete without matching evidence  

---

## 6. Enhancement / fix plan (execution order)

Work these as **Fix Waves**. Tick items in this file as you complete them; then sync the master checklist honestly.

### Wave A — Stabilize truth & deployability (do first)
1. Fix Render/Procfile/root uvicorn path (P0.1)  
2. Fix CORS allow-list (P0.3)  
3. Align metrics across notebooks → `metrics.json` → Evaluation UI → README/report (P1.6)  
4. Add metric-parity assertions to `test_backend_api.py` (P2.9)  
5. Re-run `python test_backend_api.py` + local full demo  

### Wave B — Close Must-Have UI gaps
1. Insights: add CO timeseries from `/stats/timeseries` (P1.1)  
2. Explore: add date-range filters (P1.2)  
3. Shared error/empty/retry UI on all pages (P1.3)  
4. Home KPIs from API (T/RH/AH means) (P1.4)  
5. Serve missingness from artifact file (P1.5)  

### Wave C — Academic presentation honesty
1. Relabel severity tiers as project-defined bins (P2.2)  
2. Custom-predict disclaimer (P2.1)  
3. Real team member names (P2.4)  
4. Export PDF report (P2.3)  
5. Correct checklist Phase 11–12 ticks (P0.2)  

### Wave D — Go live + verify DoD
1. Deploy API (Render) + frontend (Vercel) with correct start command & `VITE_API_URL`  
2. Production smoke: Home KPIs, Insights charts, ≥5 Predict timestamps, Evaluation metrics  
3. Put URLs on README + Team  
4. Optional: demo video backup + code-splitting (P2.6 / P3)  
5. Final honest checklist audit  

---

## 7. Suggested fix checklist (copy into workstream)

### Wave A
- [x] P0.1 Render/Procfile start command fixed and documented  
- [x] P0.3 CORS allow-list applied  
- [x] P1.6 metrics.json includes all reported models OR docs trimmed to match  
- [x] Evaluation UI renders comparison dynamically from API keys  
- [x] Parity tests added and passing  

### Wave B
- [x] Insights CO timeseries chart live  
- [x] Explore date-range filters live  
- [x] Error/empty states on Home, Explore, Insights, Predict, Evaluation  
- [x] Home weather/sensor stats from API  
- [x] Missingness from exported artifact  

### Wave UI
- [x] Design tokens + fonts (Plus Jakarta Sans / Sora / IBM Plex Mono)  
- [x] Shared GlassCard, ErrorState, LoadingState, COGauge  
- [x] Home redesigned with live KPI pods + gauge  
- [x] Insights gains CO timeseries with gradient area  
- [x] Explore gains date filters + polished table chrome  
- [x] Predict / Evaluation severity wording + motion polish  

### Wave C
- [x] Severity wording fixed  
- [x] Custom mode disclaimer added  
- [x] Team/report use honest Member B/C placeholders (legal names left for group fill-in)  
- [x] PDF exported to `reports/AIRWATCH_CO_FINAL_STATISTICS_REPORT.pdf`  
- [x] Checklist Phase 11–12 corrected (cloud items left unchecked until live deploy)  

### Wave D
- [x] Local API URL healthy (`http://localhost:8000`)  
- [x] Local dashboard URL healthy (`http://localhost:5173`)  
- [x] Local smoke path signed off via automated tests + build  
- [x] README/Team local URLs + deploy config documented  
- [ ] Public cloud URLs (optional; requires user Render/Vercel credentials)  

---

## 8. Definition of Done (revised, audit-grade)

The system is **complete for local college demo / submission packaging** when:

1. Notebooks reproduce cleaned data + model metrics end-to-end.  
2. `metrics.json`, report, README, and Evaluation UI show **the same model set and numbers**.  
3. Local demo path Home → Explore → Insights → Predict → Evaluation works with visible errors if API down.  
4. Insights includes CO timeseries; Explore includes date filters.  
5. Production **start command** is correct; public cloud `/health` is optional until credentials exist.  
6. Local dashboard predicts historical timestamps successfully.  
7. Report PDF + HTML + MD exist; Member B/C legal names filled before final hand-in.  
8. Master checklist ticks match evidence (no aspirational cloud checks).  

---

## 9. Wave UI — Reference-inspired visual redesign (locked)

Reference moodboards (product comparison, WeatherSwim, BreatheairMind, ops-center cyan) inform **visual language only**. We do **not** fake multi-city maps or live AQI APIs — our data is one Italian station, historical hourly CO.

### Suitable patterns we adopt
- Soft cyan–white atmospheric canvas + glass / soft-shadow cards  
- Floating circular KPI pods (Temp, RH, CO, sensor) driven by API  
- Semi-circular CO concentration gauge (project tiers, not WHO AQI claims)  
- Pill navigation, large radii, gentle hover/transition motion  
- Gradient-filled trend charts (Recharts) for CO timeseries + forecast-vs-actual  
- Pollutant/status color system: teal (good/low), amber (moderate), rose (high)

### Patterns we intentionally skip
- World/city product comparison maps  
- Fake real-time Singapore/NY overlays  
- Purple-on-white generic AI theme  
- Monitor hardware marketplace tables

### Wave UI checklist
- [x] Design tokens + fonts (Plus Jakarta Sans / Sora / IBM Plex Mono)  
- [x] Shared GlassCard, ErrorState, LoadingState, COGauge  
- [x] Home redesigned with live KPI pods + gauge  
- [x] Insights gains CO timeseries with gradient area  
- [x] Explore gains date filters + polished table chrome  
- [x] Predict / Evaluation severity wording + motion polish  

## 10. Recommended next action

**Done for local completeness.** Remaining human steps only:
1. Replace Member B / Member C with legal names.  
2. Optional: deploy Render + Vercel and paste public URLs.  
3. Rehearse 8–10 min viva with `start_project.ps1`.

---

## 10. Audit evidence log (commands run)

| Check | Result |
|-------|--------|
| Critical files exist (`model.joblib`, cleaned CSV, 4 notebooks, figures) | Pass |
| Cleaned CSV integrity (no `-200`, splits, `CO_next`) | Pass |
| `python test_backend_api.py` | Pass (all endpoints) |
| `npm run build` | Pass (chunk size warning) |
| Model load + sample predict | Pass (`HistGradientBoostingRegressor`, 28 features) |
| Live production URL verification | **Not found / not verified** |
| Checklist vs reality (Phase 12) | **Mismatch** |

---

*This audit file is the working enhancement backlog for bringing AirWatch CO to master-plan completeness with accurate, presentable, deployable output.*
