from fastapi import APIRouter
from backend.app.schemas.api_schemas import HealthResponse, MetaResponse
from backend.app.services.data_service import data_service

router = APIRouter(tags=["Health & Metadata"])

@router.get("/health", response_model=HealthResponse)
def get_health():
    return HealthResponse(status="ok", version="1.0.0")

@router.get("/meta", response_model=MetaResponse)
def get_meta():
    return data_service.get_meta()
