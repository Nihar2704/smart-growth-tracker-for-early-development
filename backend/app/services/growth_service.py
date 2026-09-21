from datetime import date
from typing import Tuple, Dict, Any, List
from sqlalchemy.orm import Session
from app.models.growth import GrowthMeasurement
from app.models.child import Child


def calculate_age_in_months(dob: date, target_date: date = None) -> float:
    """Calculate age in months between dob and target_date (defaulting to today)."""
    if target_date is None:
        target_date = date.today()
    
    if target_date < dob:
        return 0.0

    days = (target_date - dob).days
    return round(days / 30.4375, 1)


def format_age(months: float) -> str:
    """Format age in months into a human-readable string (years & months)."""
    if months < 1:
        return "Newborn (< 1 mo)"
    
    years = int(months // 12)
    rem_months = int(round(months % 12))
    
    if years == 0:
        return f"{rem_months} mo"
    elif rem_months == 0:
        return f"{years} yr" if years == 1 else f"{years} yrs"
    else:
        return f"{years} yr {rem_months} mo" if years == 1 else f"{years} yrs {rem_months} mo"


def calculate_bmi(height_cm: float, weight_kg: float) -> float:
    """Calculate BMI given height in cm and weight in kg."""
    if height_cm <= 0 or weight_kg <= 0:
        raise ValueError("Height and weight must be positive non-zero values.")
    
    height_m = height_cm / 100.0
    bmi = weight_kg / (height_m ** 2)
    return round(bmi, 2)


def validate_growth_measurement(dob: date, measurement_date: date, height_cm: float, weight_kg: float) -> None:
    """Validate measurement input constraints."""
    if measurement_date < dob:
        raise ValueError(f"Measurement date ({measurement_date}) cannot be earlier than child's birth date ({dob}).")
    
    if measurement_date > date.today():
        raise ValueError("Measurement date cannot be in the future.")

    if height_cm < 20 or height_cm > 200:
        raise ValueError("Height must be between 20 cm and 200 cm.")

    if weight_kg < 0.5 or weight_kg > 100:
        raise ValueError("Weight must be between 0.5 kg and 100 kg.")


def get_growth_summary(db: Session, child: Child) -> Dict[str, Any]:
    """Retrieve complete growth summary and measurement history for a child profile."""
    measurements = (
        db.query(GrowthMeasurement)
        .filter(GrowthMeasurement.child_id == child.id)
        .order_by(GrowthMeasurement.measurement_date.asc())
        .all()
    )

    if not measurements:
        return {
            "child_id": child.id,
            "child_name": child.name,
            "latest_height_cm": None,
            "latest_weight_kg": None,
            "latest_bmi": None,
            "latest_measurement_date": None,
            "total_measurements": 0,
            "measurements": [],
        }

    latest = measurements[-1]

    formatted_measurements = [
        {
            "id": m.id,
            "child_id": m.child_id,
            "height_cm": m.height_cm,
            "weight_kg": m.weight_kg,
            "bmi": m.bmi,
            "measurement_date": m.measurement_date,
            "age_months_at_measurement": calculate_age_in_months(child.date_of_birth, m.measurement_date),
            "created_at": m.created_at,
        }
        for m in measurements
    ]

    return {
        "child_id": child.id,
        "child_name": child.name,
        "latest_height_cm": latest.height_cm,
        "latest_weight_kg": latest.weight_kg,
        "latest_bmi": latest.bmi,
        "latest_measurement_date": latest.measurement_date,
        "total_measurements": len(measurements),
        "measurements": formatted_measurements,
    }
