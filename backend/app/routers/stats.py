from fastapi import APIRouter, Query, HTTPException
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


@router.get("/distribution", response_model=Dict[str, Any])
def get_distribution(
    variable: str = Query("CO(GT)", description="Numeric variable for histogram + normal overlay"),
    bins: int = Query(30, ge=10, le=60),
):
    try:
        return data_service.get_distribution(variable=variable, bins=bins)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/outliers", response_model=Dict[str, Any])
def get_outliers(
    variable: str = Query("CO(GT)", description="Numeric variable for IQR fence analysis"),
):
    try:
        return data_service.get_outliers_iqr(variable=variable)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/probabilities", response_model=Dict[str, Any])
def get_probabilities():
    return data_service.get_probabilities()


@router.get("/methods-summary", response_model=Dict[str, Any])
def get_methods_summary():
    return data_service.get_methods_summary()
