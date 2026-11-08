from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"

class MetaResponse(BaseModel):
    app_name: str
    group: str
    target: str
    primary_model: str
    total_records: int
    date_range: Dict[str, str]
    features_count: int

class OverviewResponse(BaseModel):
    total_hours: int
    date_range: Dict[str, str]
    co_stats: Dict[str, float]
    weather_stats: Dict[str, float]
    sensor_stats: Dict[str, float]
    primary_model: Dict[str, Any]
    models_comparison: Dict[str, Any]

class PredictRequest(BaseModel):
    datetime_str: Optional[str] = Field(None, description="ISO timestamp for historical test observation")
    custom_features: Optional[Dict[str, float]] = Field(None, description="Direct feature mapping if not using timestamp")

class PredictResponse(BaseModel):
    datetime: Optional[str] = None
    predicted_co_next: float
    actual_co_next: Optional[float] = None
    current_co: Optional[float] = None
    residual: Optional[float] = None
    abs_error: Optional[float] = None
    features_used: Dict[str, float]
