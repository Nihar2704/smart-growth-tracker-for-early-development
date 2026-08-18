import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.database import get_db
from app.models.child import Child
from app.models.growth import GrowthMeasurement
from app.schemas.child import ChildCreate, ChildUpdate, ChildResponse
from app.services.growth_service import calculate_age_in_months, format_age

router = APIRouter(prefix="/api/children", tags=["children"])


def _enrich_child_response(child: Child) -> ChildResponse:
    age_months = calculate_age_in_months(child.date_of_birth)
    age_str = format_age(age_months)
    return ChildResponse(
        id=child.id,
        user_id=child.user_id,
        name=child.name,
        date_of_birth=child.date_of_birth,
        sex=child.sex,
        created_at=child.created_at,
        age_in_months=age_months,
        age_formatted=age_str
    )


@router.post("", response_model=ChildResponse, status_code=status.HTTP_201_CREATED)
def create_child(child_in: ChildCreate, db: Session = Depends(get_db)):
    db_child = Child(
        name=child_in.name,
        date_of_birth=child_in.date_of_birth,
        sex=child_in.sex,
        user_id=child_in.user_id
    )
    db.add(db_child)
    db.commit()
    db.refresh(db_child)
    return _enrich_child_response(db_child)


@router.get("", response_model=List[ChildResponse])
def list_children(db: Session = Depends(get_db)):
    children = db.query(Child).order_by(Child.name).all()
    return [_enrich_child_response(c) for c in children]


@router.get("/{child_id}", response_model=ChildResponse)
def get_child(child_id: int, db: Session = Depends(get_db)):
    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child profile not found")
    return _enrich_child_response(child)


@router.put("/{child_id}", response_model=ChildResponse)
def update_child(child_id: int, child_in: ChildUpdate, db: Session = Depends(get_db)):
    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child profile not found")

    update_data = child_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(child, field, value)

    db.commit()
    db.refresh(child)
    return _enrich_child_response(child)


@router.delete("/{child_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_child(child_id: int, db: Session = Depends(get_db)):
    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child profile not found")
    db.delete(child)
    db.commit()
    return None
