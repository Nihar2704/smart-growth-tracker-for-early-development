import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from sqlalchemy import Column, Integer, Float, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class MilestoneAssessment(Base):
    __tablename__ = "milestone_assessments"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False)
    age_months = Column(Integer, nullable=False)
    age_group = Column(Integer, nullable=False)
    assessment_date = Column(Date, nullable=False)
    
    gross_motor_score = Column(Float, nullable=False, default=0.0)
    fine_motor_score = Column(Float, nullable=False, default=0.0)
    language_score = Column(Float, nullable=False, default=0.0)
    cognitive_score = Column(Float, nullable=False, default=0.0)
    social_emotional_score = Column(Float, nullable=False, default=0.0)
    
    not_observed_count = Column(Integer, nullable=False, default=0)
    unsure_count = Column(Integer, nullable=False, default=0)
    completion_ratio = Column(Float, nullable=False, default=1.0)
    
    status = Column(String, nullable=False, default="On Track")
    guidance_json = Column(Text, nullable=True)
    responses_json = Column(Text, nullable=False)  # Stores JSON mapping of question ID -> answer string
    
    created_at = Column(DateTime, default=datetime.utcnow)

    child = relationship("Child", back_populates="milestone_assessments")
