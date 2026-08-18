import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.child import Child
from app.models.growth import GrowthMeasurement
from app.schemas.growth import GrowthCreate, GrowthResponse, GrowthSummary
from app.services.growth_service import (
    calculate_age_in_months,
    calculate_bmi,
    validate_growth_measurement,
)

router = APIRouter(tags=["growth"])


def _enrich_growth_response(m: GrowthMeasurement, dob) -> GrowthResponse:
    age_at_meas = calculate_age_in_months(dob, m.measurement_date)
    return GrowthResponse(
        id=m.id,
        child_id=m.child_id,
        height_cm=m.height_cm,
        weight_kg=m.weight_kg,
        bmi=m.bmi,
        measurement_date=m.measurement_date,
        age_months_at_measurement=age_at_meas,
        created_at=m.created_at,
    )


@router.post("/api/children/{child_id}/measurements", response_model=GrowthResponse, status_code=status.HTTP_201_CREATED)
def add_growth_measurement(child_id: int, growth_in: GrowthCreate, db: Session = Depends(get_db)):
    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child profile not found")

    try:
        validate_growth_measurement(
            dob=child.date_of_birth,
            measurement_date=growth_in.measurement_date,
            height_cm=growth_in.height_cm,
            weight_kg=growth_in.weight_kg,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    bmi = calculate_bmi(growth_in.height_cm, growth_in.weight_kg)

    measurement = GrowthMeasurement(
        child_id=child_id,
        height_cm=growth_in.height_cm,
        weight_kg=growth_in.weight_kg,
        bmi=bmi,
        measurement_date=growth_in.measurement_date,
    )

    db.add(measurement)
    db.commit()
    db.refresh(measurement)

    return _enrich_growth_response(measurement, child.date_of_birth)


@router.get("/api/children/{child_id}/measurements", response_model=List[GrowthResponse])
def get_growth_measurements(child_id: int, db: Session = Depends(get_db)):
    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child profile not found")

    measurements = (
        db.query(GrowthMeasurement)
        .filter(GrowthMeasurement.child_id == child_id)
        .order_by(GrowthMeasurement.measurement_date.asc())
        .all()
    )

    return [_enrich_growth_response(m, child.date_of_birth) for m in measurements]


@router.get("/api/children/{child_id}/growth-summary", response_model=GrowthSummary)
def get_growth_summary(child_id: int, db: Session = Depends(get_db)):
    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child profile not found")

    measurements = (
        db.query(GrowthMeasurement)
        .filter(GrowthMeasurement.child_id == child_id)
        .order_by(GrowthMeasurement.measurement_date.asc())
        .all()
    )

    enriched = [_enrich_growth_response(m, child.date_of_birth) for m in measurements]

    latest_h = enriched[-1].height_cm if enriched else None
    latest_w = enriched[-1].weight_kg if enriched else None
    latest_bmi = enriched[-1].bmi if enriched else None
    latest_date = enriched[-1].measurement_date if enriched else None

    return GrowthSummary(
        child_id=child.id,
        child_name=child.name,
        total_measurements=len(enriched),
        latest_height_cm=latest_h,
        latest_weight_kg=latest_w,
        latest_bmi=latest_bmi,
        latest_measurement_date=latest_date,
        measurements=enriched,
    )


@router.delete("/api/measurements/{measurement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_measurement(measurement_id: int, db: Session = Depends(get_db)):
    m = db.query(GrowthMeasurement).filter(GrowthMeasurement.id == measurement_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Measurement record not found")

    db.delete(m)
    db.commit()
    return None
