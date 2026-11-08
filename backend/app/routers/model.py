from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List
from backend.app.schemas.api_schemas import PredictRequest, PredictResponse
from backend.app.services.data_service import data_service

router = APIRouter(prefix="/model", tags=["Model Lab & Forecasting"])

@router.get("/info", response_model=Dict[str, Any])
def get_model_info():
    return {
        "model_family": "HistGradientBoostingRegressor",
        "primary_model_summary": data_service.metrics.get("primary_model", {}),
        "best_hyperparameters": data_service.metrics.get("best_hyperparameters", {}),
        "target": data_service.metrics.get("target_variable"),
        "features": data_service.features,
        "feature_schema": data_service.feature_schema
    }

@router.get("/sample-timestamps", response_model=List[Dict[str, Any]])
def get_sample_test_timestamps(count: int = Query(60, ge=1, le=200)):
    return data_service.get_sample_test_timestamps(count=count)

@router.post("/predict", response_model=PredictResponse)
def predict_co_next(req: PredictRequest):
    if req.datetime_str:
        try:
            res = data_service.predict_by_timestamp(req.datetime_str)
            return PredictResponse(**res)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
    elif req.custom_features:
        try:
            res = data_service.predict_custom_features(req.custom_features)
            return PredictResponse(**res)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    else:
        raise HTTPException(
            status_code=400,
            detail="Either 'datetime_str' or 'custom_features' must be provided in request body."
        )

@router.get("/evaluation", response_model=Dict[str, Any])
def get_evaluation():
    return data_service.get_evaluation_details()
