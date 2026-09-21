import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.child import Child
from app.models.user import User
from app.schemas.child import ChildCreate, ChildUpdate, ChildResponse
from app.services.growth_service import calculate_age_in_months, format_age
from app.services.auth_service import require_current_user

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


def check_child_access(child: Child, current_user: User):
    if current_user.role != "admin" and child.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You are not authorized to view or edit this child profile."
        )


@router.get("", response_model=List[ChildResponse])
def list_children(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user)
):
    if current_user.role == "admin":
        children = db.query(Child).order_by(Child.name).all()
    else:
        children = db.query(Child).filter(Child.user_id == current_user.id).order_by(Child.name).all()
    return [_enrich_child_response(c) for c in children]


@router.post("", response_model=ChildResponse, status_code=status.HTTP_201_CREATED)
def create_child(
    child_in: ChildCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user)
):
    db_child = Child(
        name=child_in.name,
        date_of_birth=child_in.date_of_birth,
        sex=child_in.sex,
        user_id=current_user.id
    )
    db.add(db_child)
    db.commit()
    db.refresh(db_child)
    return _enrich_child_response(db_child)


@router.get("/{child_id}", response_model=ChildResponse)
def get_child(
    child_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user)
):
    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child profile not found")
    check_child_access(child, current_user)
    return _enrich_child_response(child)


@router.put("/{child_id}", response_model=ChildResponse)
def update_child(
    child_id: int,
    child_in: ChildUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user)
):
    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child profile not found")
    check_child_access(child, current_user)

    if child_in.name is not None:
        child.name = child_in.name
    if child_in.date_of_birth is not None:
        child.date_of_birth = child_in.date_of_birth
    if child_in.sex is not None:
        child.sex = child_in.sex

    db.commit()
    db.refresh(child)
    return _enrich_child_response(child)


@router.delete("/{child_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_child(
    child_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user)
):
    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child profile not found")
    check_child_access(child, current_user)
    db.delete(child)
    db.commit()
    return None