# AirWatch CO — PlantUML diagrams

Professional diagrams for notes, slides, and viva.

| PNG | Source | Content |
|-----|--------|---------|
| [`01_end_to_end_pipeline.png`](01_end_to_end_pipeline.png) | [`.puml`](01_end_to_end_pipeline.puml) | Full pipeline: data → clean → EDA → model → eval → dashboard |
| [`02_cleaning_and_validation.png`](02_cleaning_and_validation.png) | [`.puml`](02_cleaning_and_validation.puml) | `-200` cleaning + time-series split vs random K-fold |
| [`03_models_and_metrics.png`](03_models_and_metrics.png) | [`.puml`](03_models_and_metrics.puml) | Five models + RMSE/MAE/R² + champion |

## How to view / export PNG

1. **VS Code / Cursor:** install “PlantUML” extension → open a `.puml` → preview.  
2. **Web:** paste file contents into https://www.plantuml.com/plantuml/uml/  
3. **CLI (if Java + PlantUML jar installed):**  
   `java -jar plantuml.jar docs/diagrams/*.puml`

Color language: sky blue (`#0284C7`) aligned with AirWatch CO UI; red/amber for warnings and metric direction.

Related notes: [`../AIRWATCH_PERSONAL_NOTES.md`](../AIRWATCH_PERSONAL_NOTES.md)
