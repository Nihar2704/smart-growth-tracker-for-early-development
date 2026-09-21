import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from datetime import date

from app.database import get_db
from app.models.child import Child
from app.models.user import User
from app.models.growth import GrowthMeasurement
from app.models.milestone import MilestoneAssessment
from app.models.prediction import Prediction
from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    ModelInfoResponse,
    FactorItem,
)
from app.services.ml_service import ml_service
from app.services.auth_service import require_current_user
from app.routers.children import check_child_access

router = APIRouter(tags=["predictions"])


def _format_prediction_response(p: Prediction) -> PredictionResponse:
    factors_list = json.loads(p.contributing_factors_json) if p.contributing_factors_json else []
    formatted_factors = []
    for f in factors_list:
        val_str = f.get("value", "")
        if "10000%" in val_str:
            val_str = val_str.replace("10000%", "100%")
        elif "000%" in val_str:
            val_str = val_str.replace("000%", "%")

        formatted_factors.append(
            FactorItem(
                feature=f.get("feature", ""),
                label=f.get("label", ""),
                value=val_str,
                impact=f.get("impact", "Neutral"),
            )
        )

    return PredictionResponse(
        id=p.id,
        child_id=p.child_id,
        milestone_assessment_id=p.milestone_assessment_id,
        predicted_class=p.predicted_class,
        monitoring_probability=p.monitoring_probability,
        status=p.status,
        guidance=p.guidance or "",
        contributing_factors=formatted_factors,
        model_version=p.model_version,
        created_at=p.created_at,
    )


@router.get("/api/ml/info", response_model=ModelInfoResponse)
def get_model_info():
    info = ml_service.get_info()
    return ModelInfoResponse(
        model_loaded=info["model_loaded"],
        algorithm_name=info["algorithm_name"],
        model_version=info["model_version"],
        calibrated=info["calibrated"],
        features_count=info["features_count"],
        metrics=info["metrics"],
    )


@router.post(
    "/api/children/{child_id}/predict",
    response_model=PredictionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_prediction(
    child_id: int,
    req: Optional[PredictionRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user)
):
    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child profile not found")
    check_child_access(child, current_user)

    latest_growth = (
        db.query(GrowthMeasurement)
        .filter(GrowthMeasurement.child_id == child_id)
        .order_by(GrowthMeasurement.measurement_date.desc())
        .first()
    )

    if not latest_growth:
        raise HTTPException(
            status_code=400,
            detail="Growth measurement required before generating ML prediction.",
        )

    assessment_id = req.milestone_assessment_id if req else None
    if assessment_id:
        assessment = (
            db.query(MilestoneAssessment)
            .filter(
                MilestoneAssessment.id == assessment_id,
                MilestoneAssessment.child_id == child_id,
            )
            .first()
        )
    else:
        assessment = (
            db.query(MilestoneAssessment)
            .filter(MilestoneAssessment.child_id == child_id)
            .order_by(MilestoneAssessment.assessment_date.desc())
            .first()
        )

    gm = (assessment.gross_motor_score / 100.0) if assessment else 1.0
    fm = (assessment.fine_motor_score / 100.0) if assessment else 1.0
    lang = (assessment.language_score / 100.0) if assessment else 1.0
    cog = (assessment.cognitive_score / 100.0) if assessment else 1.0
    soc = (assessment.social_emotional_score / 100.0) if assessment else 1.0

    not_obs = assessment.not_observed_count if assessment else 0
    unsure = assessment.unsure_count if assessment else 0
    comp_ratio = assessment.completion_ratio if assessment else 1.0
    ref_date = assessment.assessment_date if assessment else latest_growth.measurement_date

    pred_class, prob_pct, status_str, guidance_str, factors = ml_service.predict(
        child_dob=child.date_of_birth,
        sex_str=child.sex,
        height_cm=latest_growth.height_cm,
        weight_kg=latest_growth.weight_kg,
        bmi=latest_growth.bmi,
        gross_motor_score=gm,
        fine_motor_score=fm,
        language_score=lang,
        cognitive_score=cog,
        social_emotional_score=soc,
        not_observed_count=not_obs,
        unsure_count=unsure,
        completion_ratio=comp_ratio,
        ref_date=ref_date,
    )

    prediction = Prediction(
        child_id=child_id,
        milestone_assessment_id=assessment.id if assessment else None,
        predicted_class=pred_class,
        monitoring_probability=prob_pct,
        status=status_str,
        guidance=guidance_str,
        contributing_factors_json=json.dumps(factors),
        model_version=ml_service.get_info()["model_version"],
    )

    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return _format_prediction_response(prediction)


@router.get(
    "/api/children/{child_id}/predictions",
    response_model=List[PredictionResponse],
)
def get_child_predictions(
    child_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user)
):
    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child profile not found")
    check_child_access(child, current_user)

    predictions = (
        db.query(Prediction)
        .filter(Prediction.child_id == child_id)
        .order_by(Prediction.created_at.desc())
        .all()
    )

    return [_format_prediction_response(p) for p in predictions]
