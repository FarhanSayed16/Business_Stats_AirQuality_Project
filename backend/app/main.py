from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# Mount Routers
app.include_router(health.router)
app.include_router(stats.router)
app.include_router(data.router)
app.include_router(model.router)

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to AirWatch CO Intelligence API",
        "docs_url": "/docs",
        "health_url": "/health",
        "meta_url": "/meta",
        "group": "Group 3 — Air Quality and Pollution"
    }
