from pydantic import BaseModel, Field, field_validator
from datetime import date, datetime
from typing import Optional, List


class ChildBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, example="Aarav Sharma")
    date_of_birth: date = Field(..., example="2023-05-15")
    sex: str = Field(..., example="male")

    @field_validator("sex")
    def validate_sex(cls, v):
        v_clean = v.lower().strip()
        if v_clean not in ["male", "female", "other"]:
            raise ValueError("Sex must be 'male', 'female', or 'other'")
        return v_clean

    @field_validator("date_of_birth")
    def validate_dob(cls, v):
        if v > date.today():
            raise ValueError("Date of birth cannot be in the future")
        return v


class ChildCreate(ChildBase):
    user_id: Optional[int] = None


class ChildUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    date_of_birth: Optional[date] = None
    sex: Optional[str] = None


class ChildResponse(ChildBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    age_in_months: float
    age_formatted: str

    class Config:
        from_attributes = True
