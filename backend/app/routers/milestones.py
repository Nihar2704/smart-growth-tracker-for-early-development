import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict
from datetime import date

from app.database import get_db
from app.models.child import Child
from app.models.user import User
from app.models.growth import GrowthMeasurement
from app.models.milestone import MilestoneAssessment
from app.schemas.milestone import (
    MilestoneQuestionSet,
    MilestoneQuestion,
    MilestoneAssessmentCreate,
    MilestoneAssessmentResponse,
    DomainScore,
)
from app.rules.rule_engine import (
    get_questions_for_age,
    evaluate_milestone_assessment,
    calculate_age_months,
    DOMAIN_NAMES,
)
from app.services.auth_service import require_current_user
from app.routers.children import check_child_access

router = APIRouter(tags=["milestones"])


def _format_assessment_response(a: MilestoneAssessment) -> MilestoneAssessmentResponse:
    guidance_list = json.loads(a.guidance_json) if a.guidance_json else []
    responses_map = json.loads(a.responses_json) if a.responses_json else {}

    dataset_questions = get_questions_for_age(a.age_months)[1]
    domain_totals = {d: 0 for d in DOMAIN_NAMES.keys()}
    domain_achieved = {d: 0 for d in DOMAIN_NAMES.keys()}
    domain_not_observed = {d: 0 for d in DOMAIN_NAMES.keys()}
    domain_unsure = {d: 0 for d in DOMAIN_NAMES.keys()}

    for q in dataset_questions:
        d = q["domain"]
        domain_totals[d] = domain_totals.get(d, 0) + 1
        ans = responses_map.get(q["id"])
        if ans == "achieved":
            domain_achieved[d] = domain_achieved.get(d, 0) + 1
        elif ans == "not_yet_observed":
            domain_not_observed[d] = domain_not_observed.get(d, 0) + 1
        elif ans == "unsure":
            domain_unsure[d] = domain_unsure.get(d, 0) + 1

    scores_map = {
        "gross_motor": a.gross_motor_score,
        "fine_motor": a.fine_motor_score,
        "language": a.language_score,
        "cognitive": a.cognitive_score,
        "social_emotional": a.social_emotional_score,
    }

    domain_breakdown = []
    for key, name in DOMAIN_NAMES.items():
        score = scores_map.get(key, 0.0)
        tot = domain_totals.get(key, 0)
        ach = domain_achieved.get(key, 0)
        not_obs = domain_not_observed.get(key, 0)
        uns = domain_unsure.get(key, 0)

        domain_breakdown.append(
            DomainScore(
                domain=key,
                domain_key=key,
                domain_name=name,
                score=round(score, 1),
                score_percentage=round(score, 1),
                total_questions=tot,
                achieved_count=ach,
                not_observed_count=not_obs,
                unsure_count=uns,
            )
        )

    return MilestoneAssessmentResponse(
        id=a.id,
        child_id=a.child_id,
        age_months=a.age_months,
        age_group=a.age_group,
        assessment_date=a.assessment_date,
        gross_motor_score=a.gross_motor_score,
        fine_motor_score=a.fine_motor_score,
        language_score=a.language_score,
        cognitive_score=a.cognitive_score,
        social_emotional_score=a.social_emotional_score,
        not_observed_count=a.not_observed_count,
        unsure_count=a.unsure_count,
        completion_ratio=a.completion_ratio,
        status=a.status,
        guidance=guidance_list,
        domain_breakdown=domain_breakdown,
        domain_scores=domain_breakdown,
        responses=responses_map,
        created_at=a.created_at,
    )


@router.get("/api/milestones/questions", response_model=MilestoneQuestionSet)
def get_milestone_questions(age_months: int):
    if age_months < 0 or age_months > 72:
        raise HTTPException(status_code=400, detail="Age in months must be between 0 and 72")

    age_group, questions = get_questions_for_age(age_months)
    formatted_q = [
        MilestoneQuestion(
            id=q["id"],
            domain=q["domain"],
            text=q["text"],
            hindi_text=q.get("hindi_text", ""),
            example_text=q.get("example_text", ""),
            hindi_example_text=q.get("hindi_example_text", ""),
            play_idea=q.get("play_idea", ""),
        )
        for q in questions
    ]

    return MilestoneQuestionSet(
        age_months=age_months,
        age_group=age_group,
        questions=formatted_q,
    )


@router.post(
    "/api/children/{child_id}/assessments",
    response_model=MilestoneAssessmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_milestone_assessment(
    child_id: int,
    assessment_in: MilestoneAssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user)
):
    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child profile not found")
    check_child_access(child, current_user)

    if assessment_in.assessment_date > date.today():
        raise HTTPException(status_code=400, detail="Assessment date cannot be in the future")

    if assessment_in.assessment_date < child.date_of_birth:
        raise HTTPException(status_code=400, detail="Assessment date cannot be before date of birth")

    latest_growth = (
        db.query(GrowthMeasurement)
        .filter(GrowthMeasurement.child_id == child_id)
        .order_by(GrowthMeasurement.measurement_date.desc())
        .first()
    )

    growth_dict = None
    if latest_growth:
        growth_dict = {
            "height_cm": latest_growth.height_cm,
            "weight_kg": latest_growth.weight_kg,
            "bmi": latest_growth.bmi,
        }

    responses_list = [
        {"question_id": r.question_id, "answer": r.answer}
        for r in assessment_in.responses
    ]

    eval_result = evaluate_milestone_assessment(
        child_dob=child.date_of_birth,
        assessment_date=assessment_in.assessment_date,
        responses=responses_list,
        latest_growth=growth_dict,
    )

    assessment = MilestoneAssessment(
        child_id=child_id,
        age_months=eval_result["age_months"],
        age_group=eval_result["age_group"],
        assessment_date=assessment_in.assessment_date,
        gross_motor_score=eval_result["gross_motor_score"],
        fine_motor_score=eval_result["fine_motor_score"],
        language_score=eval_result["language_score"],
        cognitive_score=eval_result["cognitive_score"],
        social_emotional_score=eval_result["social_emotional_score"],
        not_observed_count=eval_result["not_observed_count"],
        unsure_count=eval_result["unsure_count"],
        completion_ratio=eval_result["completion_ratio"],
        status=eval_result["status"],
        guidance_json=json.dumps(eval_result["guidance"]),
        responses_json=json.dumps(eval_result["responses_map"]),
    )

    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    return _format_assessment_response(assessment)


@router.get("/api/children/{child_id}/assessments", response_model=List[MilestoneAssessmentResponse])
def get_child_assessments(
    child_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user)
):
    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child profile not found")
    check_child_access(child, current_user)

    assessments = (
        db.query(MilestoneAssessment)
        .filter(MilestoneAssessment.child_id == child_id)
        .order_by(MilestoneAssessment.assessment_date.desc())
        .all()
    )

    return [_format_assessment_response(a) for a in assessments]


@router.get("/api/children/{child_id}/assessments/{assessment_id}", response_model=MilestoneAssessmentResponse)
def get_assessment_detail(
    child_id: int,
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user)
):
    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child profile not found")
    check_child_access(child, current_user)

    assessment = (
        db.query(MilestoneAssessment)
        .filter(MilestoneAssessment.id == assessment_id, MilestoneAssessment.child_id == child_id)
        .first()
    )

    if not assessment:
        raise HTTPException(status_code=404, detail="Milestone assessment not found")

    return _format_assessment_response(assessment)
