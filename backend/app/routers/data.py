import os
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import FileResponse
from typing import Optional, List, Dict, Any
from backend.app.services.data_service import data_service

router = APIRouter(prefix="/data", tags=["Dataset Explorer"])

@router.get("", response_model=Dict[str, Any])
def get_data_rows(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=10, le=200),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    hour: Optional[int] = Query(None, ge=0, le=23)
):
    return data_service.get_paginated_data(
        page=page,
        page_size=page_size,
        start_date=start_date,
        end_date=end_date,
        hour=hour
    )

@router.get("/missingness", response_model=List[Dict[str, Any]])
def get_missingness():
    return data_service.get_missingness_summary()

@router.get("/download")
def download_cleaned_dataset():
    possible_paths = [
        os.path.abspath("data/cleaned/cleaned_air_quality.csv"),
        os.path.abspath("../data/cleaned/cleaned_air_quality.csv"),
        os.path.abspath("../../data/cleaned/cleaned_air_quality.csv")
    ]
    for p in possible_paths:
        if os.path.exists(p):
            return FileResponse(p, media_type="text/csv", filename="cleaned_air_quality.csv")
    raise HTTPException(status_code=404, detail="Cleaned dataset CSV file not found on disk.")
