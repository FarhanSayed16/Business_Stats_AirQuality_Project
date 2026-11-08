import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from backend.app.routers import health, stats, data, model

app = FastAPI(
    title="AirWatch CO — Intelligence API",
    description="FastAPI service serving statistical summaries, timeseries intelligence, and real-time next-hour Carbon Monoxide (CO) predictions for Group 3 MCA Statistics Project.",
    version="1.0.0"
)

# Explicit CORS allow-list (wildcard + credentials is invalid in browsers)
_default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]
_extra = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]
allowed_origins = list(dict.fromkeys(_default_origins + _extra))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(health.router)
app.include_router(stats.router)
app.include_router(data.router)
app.include_router(model.router)

# Serve college reports (HTML/PDF/MD) for Team page links
possible_report_dirs = [
    os.path.abspath("reports"),
    os.path.abspath("../reports"),
    os.path.abspath("../../reports"),
]
reports_dir = next((p for p in possible_report_dirs if os.path.isdir(p)), None)
if reports_dir:
    app.mount("/reports", StaticFiles(directory=reports_dir), name="reports")

# Resolve frontend dist directory for unified production serving
possible_dist_paths = [
    os.path.abspath("frontend/dist"),
    os.path.abspath("../frontend/dist"),
    os.path.abspath("../../frontend/dist")
]
dist_dir = None
for p in possible_dist_paths:
    if os.path.exists(p) and os.path.exists(os.path.join(p, "index.html")):
        dist_dir = p
        break

if dist_dir:
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/", include_in_schema=False)
    def serve_spa_root():
        return FileResponse(os.path.join(dist_dir, "index.html"))

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_frontend_spa(full_path: str):
        # Never intercept API docs or mounted static prefixes
        blocked_prefixes = ("docs", "redoc", "openapi.json", "health", "meta", "stats", "data", "model", "reports", "assets")
        if full_path.split("/", 1)[0] in blocked_prefixes:
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        target = os.path.join(dist_dir, full_path)
        if full_path and os.path.isfile(target):
            return FileResponse(target)
        return FileResponse(os.path.join(dist_dir, "index.html"))
else:
    @app.get("/", tags=["Root"])
    def root():
        return {
            "message": "Welcome to AirWatch CO Intelligence API",
            "docs_url": "/docs",
            "health_url": "/health",
            "meta_url": "/meta",
            "reports_url": "/reports/AIRWATCH_CO_FINAL_STATISTICS_REPORT.html",
            "group": "Group 3 — Air Quality and Pollution"
        }
