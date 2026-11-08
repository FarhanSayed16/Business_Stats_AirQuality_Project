"""Generate a submission-ready PDF from metrics.json + report summary."""
from __future__ import annotations

import json
from pathlib import Path

from fpdf import FPDF

ROOT = Path(__file__).resolve().parent
METRICS = json.loads((ROOT / "artifacts" / "metrics.json").read_text(encoding="utf-8"))
OUT = ROOT / "reports" / "AIRWATCH_CO_FINAL_STATISTICS_REPORT.pdf"


def ascii(text: str) -> str:
    replacements = {
        "\u2014": "-",
        "\u2013": "-",
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u00b3": "3",
        "\u00b2": "2",
    }
    for src, dst in replacements.items():
        text = text.replace(src, dst)
    return text.encode("latin-1", errors="replace").decode("latin-1")


class ReportPDF(FPDF):
    def header(self):
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(15, 118, 110)
        self.cell(0, 8, ascii("AirWatch CO - MCA I Statistics Internal Assessment | Group 3"), new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(15, 118, 110)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(100, 116, 139)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")

    def section(self, title: str):
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(15, 23, 42)
        self.ln(2)
        self.cell(0, 8, ascii(title), new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(226, 232, 240)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(3)

    def body(self, text: str):
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(51, 65, 85)
        self.multi_cell(0, 5.5, ascii(text))
        self.ln(2)


def main():
    primary = METRICS["primary_model"]
    models = METRICS["models_comparison"]
    splits = METRICS["splits"]

    pdf = ReportPDF(format="A4")
    pdf.set_margins(16, 18, 16)
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.alias_nb_pages()
    pdf.add_page()

    pdf.set_x(pdf.l_margin)
    pdf.set_font("Helvetica", "B", 16)
    pdf.set_text_color(15, 23, 42)
    pdf.multi_cell(0, 8, ascii("AirWatch CO: Predictive Modelling of Urban Carbon Monoxide"))
    pdf.ln(1)
    pdf.set_x(pdf.l_margin)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(71, 85, 105)
    pdf.multi_cell(
        0,
        5.5,
        ascii(
            "MCA I Statistics Internal Assessment - Group 3 (Air Quality and Pollution)\n"
            "Lead contributor: Farhan Sayed and Group 3\n"
            "Dataset: UCI Air Quality (CNR-ISAC, Italy)\n"
            "Target: next-hour CO(GT) = CO_next"
        ),
    )
    pdf.ln(2)

    pdf.section("1. Objective")
    pdf.body(
        "Investigate how air pollution changes over time and how it relates to weather and sensor "
        "measurements. Build a model that predicts the next hour's carbon monoxide concentration "
        "CO(GT) using only information available up to the current hour, then explain usefulness "
        "and limitations for air-quality monitoring."
    )

    pdf.section("2. Dataset and Preprocessing")
    pdf.body(
        f"Cleaned records: {METRICS['dataset_time_range']['total_records']}\n"
        f"Period: {METRICS['dataset_time_range']['start']} to {METRICS['dataset_time_range']['end']}\n"
        "Critical cleaning: hardware invalid codes (-200) treated as missing; NMHC(GT) dropped; "
        "time-aware imputation; chronological 70/15/15 split.\n"
        f"Train: {splits['train']['records']} | Val: {splits['val']['records']} | "
        f"Test: {splits['test']['records']}"
    )

    pdf.section("3. Modelling Protocol")
    pdf.body(
        "Features use only information available at hour t (sensors/weather, lags, calendar encodings). "
        "Validation uses TimeSeriesSplit (no random shuffle). Champion: Tuned HistGradientBoostingRegressor.\n"
        f"Best hyperparameters: {json.dumps(METRICS['best_hyperparameters'])}"
    )

    pdf.section("4. Holdout Test Results")
    pdf.set_x(pdf.l_margin)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(15, 23, 42)
    usable = pdf.w - pdf.l_margin - pdf.r_margin
    widths = [usable * 0.46, usable * 0.18, usable * 0.18, usable * 0.18]
    headers = ["Model", "Test RMSE", "Test MAE", "Test R2"]
    for h, w in zip(headers, widths):
        pdf.cell(w, 7, h, border=1)
    pdf.ln()
    pdf.set_font("Helvetica", "", 9)
    labels = {
        "Persistence_Baseline": "Persistence Baseline",
        "Linear_Regression": "Linear Regression",
        "Ridge_Regression": "Ridge Regression",
        "Random_Forest": "Random Forest",
        "Tuned_HistGradientBoosting": "Tuned HistGradientBoosting",
    }
    for key, row in models.items():
        pdf.set_x(pdf.l_margin)
        pdf.cell(widths[0], 6, labels.get(key, key)[:34], border=1)
        pdf.cell(widths[1], 6, f"{row['test_rmse']:.4f}", border=1)
        pdf.cell(widths[2], 6, f"{row['test_mae']:.4f}", border=1)
        pdf.cell(widths[3], 6, f"{row['test_r2']:.4f}", border=1)
        pdf.ln()
    pdf.ln(2)
    pdf.body(
        f"Champion: {primary['name']} | Test RMSE={primary['test_rmse']} | "
        f"MAE={primary['test_mae']} | R2={primary['test_r2']} | "
        f"RMSE improvement vs baseline={primary['rmse_improvement_over_baseline_pct']}%"
    )

    pdf.section("5. Usefulness and Limitations")
    pdf.body(
        "Usefulness: short-horizon monitoring support, traffic-management hints, sensor sanity checks.\n"
        "Limitations: single Italian station; historical 2004-2005 period; under-prediction on extreme "
        "high-CO hours; no explicit traffic counts; next-hour horizon only. Dashboard pollution tiers "
        "are project analytical bins (<2 / 2-4 / >4 mg/m3), not certified AQI."
    )

    pdf.section("6. Dashboard Enhancement")
    pdf.body(
        "AirWatch CO presentation layer: FastAPI + React (Home, Explore, Insights, Predict, "
        "Evaluation, Team). Core academic work remains reproducible in Python notebooks. "
        "Local demo: start_project.ps1 / start_project.bat. Cloud configs: render.yaml + "
        "frontend/vercel.json (deploy when hosting credentials are available)."
    )

    pdf.section("7. Member Contributions")
    pdf.body(
        "Farhan Sayed (Data and Architecture Lead): preprocessing, API, dashboard, report packaging.\n"
        "Member B (EDA and Analytics Lead): EDA statistics, diurnal/weekday analysis, correlation visuals. "
        "Replace with legal name before final submission.\n"
        "Member C (Predictive Modelling Lead): CO_next target, baselines, TimeSeriesSplit tuning, "
        "artifacts. Replace with legal name before final submission."
    )

    pdf.section("8. Submission Bundle")
    pdf.body(
        "Include: notebooks/01-04, data/cleaned/cleaned_air_quality.csv, artifacts/, "
        "reports/AIRWATCH_CO_FINAL_STATISTICS_REPORT.md|.html|.pdf, "
        "reports/VIVA_PRESENTATION_SCRIPT_AND_QA.md, README.md, backend/, frontend/."
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(OUT))
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
