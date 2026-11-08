# AirWatch CO — Air Quality & Pollution Intelligence

**MCA I Statistics Internal Assessment | Group 3**  
*Predictive modelling and statistical analysis of carbon monoxide concentration using the UCI Air Quality dataset, featuring an interactive FastAPI + React monitoring dashboard.*

---

## 1. Project Overview

* **Target:** Predict next hour's Carbon Monoxide concentration `CO(GT)` (`CO_next = CO(GT).shift(-1)`) using sensor, meteorological, and temporal features available up to the current hour.
* **Dataset:** UCI Air Quality dataset (`dataset/air+quality/AirQualityUCI.csv`) — ~9,358 hourly readings from an Italian urban monitoring station (March 2004 – April 2005).
* **Architecture:**
  * **Core Academic Layer (Python):** Preprocessing, EDA, Baseline & ML Models, Time-Series Tuning, and Evaluation.
  * **Presentation Layer:** FastAPI backend + React (Vite + TypeScript + Tailwind CSS + Recharts) dashboard.

---

## 2. Environment & Prerequisites

* **Python:** 3.12 (Virtual environment `.venv`)
* **Node.js:** v24.13.0
* **npm:** 11.6.2

---

## 3. Quickstart & Setup

### 3.1 Python Core Environment

1. Activate virtual environment:
   * **Windows (PowerShell):**
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
   * **Windows (Command Prompt):**
     ```cmd
     .\.venv\Scripts\activate.bat
     ```
   * **Linux / macOS:**
     ```bash
     source .venv/bin/activate
     ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Launch Jupyter Notebooks:
   ```bash
   jupyter notebook notebooks/
   ```

---

## 4. Repository Structure

```text
Business_Stats_AirQuality_Project/
├── dataset/air+quality/          # Original UCI CSV and XLSX files
├── data/cleaned/                 # Cleaned dataset (cleaned_air_quality.csv)
├── notebooks/                    # 01_preprocessing, 02_eda, 03_modelling, 04_tuning
├── artifacts/                    # model.joblib, metrics.json, feature_schema.json
├── figures/                      # EDA and residual plots for report
├── backend/                      # FastAPI service
├── frontend/                     # React + Vite + TypeScript dashboard
├── reports/                      # Final academic report (PDF/DOC)
├── docs/                         # Master execution plans & checklists
├── README.md
└── requirements.txt              # Root Python dependencies
```

---

## 5. Running the Application (Enhancement Layer)

### 5.1 FastAPI Backend (Phase 7–8)
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```
Interactive API docs: `http://localhost:8000/docs`

### 5.2 React Frontend (Phase 9–10)
```bash
cd frontend
npm install
npm run dev
```
Dashboard URL: `http://localhost:5173`
