from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List, Dict, Any


class MilestoneQuestion(BaseModel):
    id: str
    domain: str
    text: str
    hindi_text: Optional[str] = None
    example_text: Optional[str] = None
    hindi_example_text: Optional[str] = None
    play_idea: Optional[str] = None


class MilestoneQuestionSet(BaseModel):
    age_months: int
    age_group: int
    questions: List[MilestoneQuestion]


class MilestoneResponseItem(BaseModel):
    question_id: str
    answer: str  # 'achieved', 'not_yet_observed', 'unsure'


class MilestoneAssessmentCreate(BaseModel):
    assessment_date: date = Field(..., example="2026-08-15")
    responses: List[MilestoneResponseItem]


class DomainScore(BaseModel):
    domain: Optional[str] = None
    domain_key: Optional[str] = None
    domain_name: str
    score: Optional[float] = 0.0
    score_percentage: Optional[float] = 0.0
    total_questions: int
    achieved_count: int
    not_observed_count: int
    unsure_count: int


class MilestoneAssessmentResponse(BaseModel):
    id: int
    child_id: int
    age_months: int
    age_group: int
    assessment_date: date
    gross_motor_score: float
    fine_motor_score: float
    language_score: float
    cognitive_score: float
    social_emotional_score: float
    not_observed_count: int
    unsure_count: int
    completion_ratio: float
    status: str
    guidance: List[str]
    domain_breakdown: Optional[List[DomainScore]] = []
    domain_scores: Optional[List[DomainScore]] = []
    responses: Optional[Dict[str, str]] = {}
    created_at: datetime

    class Config:
        from_attributes = True
