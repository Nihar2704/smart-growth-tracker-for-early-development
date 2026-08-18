from pydantic import BaseModel, Field, field_validator
from datetime import date, datetime
from typing import Optional, List


class GrowthCreate(BaseModel):
    height_cm: float = Field(..., gt=0, lt=250, description="Height in centimeters", example=85.5)
    weight_kg: float = Field(..., gt=0, lt=150, description="Weight in kilograms", example=12.4)
    measurement_date: date = Field(..., example="2025-05-15")

    @field_validator("measurement_date")
    def validate_date(cls, v):
        if v > date.today():
            raise ValueError("Measurement date cannot be in the future")
        return v


class GrowthResponse(BaseModel):
    id: int
    child_id: int
    height_cm: float
    weight_kg: float
    bmi: float
    measurement_date: date
    age_months_at_measurement: float
    created_at: datetime

    class Config:
        from_attributes = True


class GrowthSummary(BaseModel):
    child_id: int
    child_name: str
    total_measurements: int
    latest_height_cm: Optional[float] = None
    latest_weight_kg: Optional[float] = None
    latest_bmi: Optional[float] = None
    latest_measurement_date: Optional[date] = None
    measurements: List[GrowthResponse] = []
