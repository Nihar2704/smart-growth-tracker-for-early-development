from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class PredictionRequest(BaseModel):
    milestone_assessment_id: Optional[int] = None


class FactorItem(BaseModel):
    feature: str
    label: str
    value: str
    impact: str  # "Risk Indicator", "Favorable Indicator", "Neutral"


class PredictionResponse(BaseModel):
    id: int
    child_id: int
    milestone_assessment_id: Optional[int] = None
    predicted_class: int
    monitoring_probability: float
    status: str
    guidance: str
    contributing_factors: List[FactorItem]
    model_version: str
    created_at: datetime

    class Config:
        from_attributes = True


class ModelInfoResponse(BaseModel):
    model_loaded: bool
    algorithm_name: str
    model_version: str
    calibrated: bool
    features_count: int
    metrics: Optional[Dict[str, Any]] = None
