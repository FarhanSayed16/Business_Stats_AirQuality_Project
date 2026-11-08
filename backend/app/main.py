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

# Enable CORS for local Vite development and production deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(health.router)
app.include_router(stats.router)
app.include_router(data.router)
app.include_router(model.router)

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
        if full_path in ["docs", "redoc", "openapi.json"]:
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
            "group": "Group 3 — Air Quality and Pollution"
        }
