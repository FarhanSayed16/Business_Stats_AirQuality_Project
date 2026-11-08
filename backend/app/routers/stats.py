from fastapi import APIRouter, Query
from typing import Optional, List, Dict, Any
from backend.app.schemas.api_schemas import OverviewResponse
from backend.app.services.data_service import data_service

router = APIRouter(prefix="/stats", tags=["Statistical Intelligence & EDA"])

@router.get("/overview", response_model=OverviewResponse)
def get_overview():
    return data_service.get_overview_kpis()

@router.get("/timeseries", response_model=List[Dict[str, Any]])
def get_timeseries(
    start_date: Optional[str] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date filter (YYYY-MM-DD)"),
    step: int = Query(1, ge=1, le=24, description="Sampling stride (1=hourly, 4=every 4h)")
):
    return data_service.get_timeseries(start_date=start_date, end_date=end_date, step=step)

@router.get("/hourly-pattern", response_model=List[Dict[str, Any]])
def get_hourly_pattern():
    return data_service.get_hourly_pattern()

@router.get("/weekday-pattern", response_model=List[Dict[str, Any]])
def get_weekday_pattern():
    return data_service.get_weekday_pattern()

@router.get("/correlation", response_model=Dict[str, Any])
def get_correlation():
    return data_service.get_correlation_matrix()

@router.get("/weather-scatter", response_model=List[Dict[str, Any]])
def get_weather_scatter(sample_size: int = Query(800, ge=100, le=3000)):
    return data_service.get_weather_scatter(sample_size=sample_size)
