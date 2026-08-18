import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Child(Base):
    __tablename__ = "children"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # nullable for MVP demo before auth lock
    name = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=False)
    sex = Column(String, nullable=False)  # 'male' or 'female'
    created_at = Column(DateTime, default=datetime.utcnow)

    parent = relationship("User", back_populates="children")
    growth_measurements = relationship(
        "GrowthMeasurement", back_populates="child", cascade="all, delete-orphan", order_by="GrowthMeasurement.measurement_date"
    )
    milestone_assessments = relationship(
        "MilestoneAssessment", back_populates="child", cascade="all, delete-orphan", order_by="MilestoneAssessment.assessment_date"
    )
    predictions = relationship(
        "Prediction", back_populates="child", cascade="all, delete-orphan", order_by="Prediction.created_at.desc()"
    )


