import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from sqlalchemy import Column, Integer, Float, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False)
    milestone_assessment_id = Column(Integer, ForeignKey("milestone_assessments.id"), nullable=True)
    
    predicted_class = Column(Integer, nullable=False, default=0)
    monitoring_probability = Column(Float, nullable=False, default=0.0)
    status = Column(String, nullable=False, default="Routine Monitoring")
    guidance = Column(Text, nullable=True)
    contributing_factors_json = Column(Text, nullable=True)
    model_version = Column(String, nullable=False, default="1.0.0")
    
    created_at = Column(DateTime, default=datetime.utcnow)

    child = relationship("Child", back_populates="predictions")
    milestone_assessment = relationship("MilestoneAssessment")
