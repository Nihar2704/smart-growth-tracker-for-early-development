from datetime import date
from typing import Tuple, Dict, Any, List, Optional
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


def validate_growth_measurement(
    dob: date,
    measurement_date: date,
    height_cm: float,
    weight_kg: float,
    previous_measurements: Optional[List[GrowthMeasurement]] = None
) -> None:
    """Validate measurement input constraints, biological limits, and physical velocity."""
    if measurement_date < dob:
        raise ValueError(f"Measurement date ({measurement_date}) cannot be earlier than child's birth date ({dob}).")
    
    if measurement_date > date.today():
        raise ValueError("Measurement date cannot be in the future.")

    # Biological limits for early childhood (0 - 60 months)
    if height_cm < 35 or height_cm > 160:
        raise ValueError("Height must be biologically plausible for early childhood (between 35 cm and 160 cm).")

    if weight_kg < 1.0 or weight_kg > 60:
        raise ValueError("Weight must be biologically plausible for early childhood (between 1.0 kg and 60 kg).")

    # Longitudinal Biological Velocity Check (Children do not shrink)
    if previous_measurements:
        earlier_records = [m for m in previous_measurements if m.measurement_date < measurement_date]
        if earlier_records:
            latest_earlier = max(earlier_records, key=lambda m: m.measurement_date)
            if height_cm < (latest_earlier.height_cm - 2.0):
                raise ValueError(
                    f"Height ({height_cm} cm) is lower than previous record ({latest_earlier.height_cm} cm on {latest_earlier.measurement_date}). "
                    f"Children do not biologically shrink. Please double-check for a typo."
                )
            if latest_earlier.weight_kg > 0 and ((latest_earlier.weight_kg - weight_kg) / latest_earlier.weight_kg) > 0.35:
                raise ValueError(
                    f"Weight ({weight_kg} kg) indicates a severe drop (>35%) from {latest_earlier.weight_kg} kg on {latest_earlier.measurement_date}. "
                    f"Please verify this entry."
                )



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
