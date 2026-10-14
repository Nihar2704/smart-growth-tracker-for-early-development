from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import date

from app.database import get_db
from app.models.user import User
from app.models.child import Child
from app.schemas.assistant import ChatRequest, ChatResponse, ChatContext
from app.services.auth_service import require_current_user
from app.services.ai_assistant import call_gemini_api

router = APIRouter(prefix="/api/assistant", tags=["AI Assistant"])


def _calculate_age_months(dob: Optional[date]) -> float:
    if not dob:
        return 12.0
    today = date.today()
    days = (today - dob).days
    return round(max(0.0, days / 30.4375), 1)


@router.post("/chat", response_model=ChatResponse)
def chat_with_assistant(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user),
):
    """
    Pediatric developmental assistant chatbot for parents during milestone assessments.
    Enriched with CDC/WHO developmental guidance and active child context.
    """
    context_data = {}
    
    # Enrich context from database if child_id provided
    if request.child_id:
        child = db.query(Child).filter(Child.id == request.child_id).first()
        if child:
            # Multi-tenant parent access security
            if current_user.role != "admin" and child.user_id != current_user.id:
                raise HTTPException(status_code=403, detail="Unauthorized access to this child's profile")
            
            context_data["child_name"] = child.name
            context_data["age_months"] = _calculate_age_months(child.date_of_birth)
            context_data["gender"] = child.gender

    # Merge explicit context sent from client (active question, domain, scores)
    if request.context:
        client_ctx = request.context.model_dump(exclude_unset=True)
        for k, v in client_ctx.items():
            if v is not None:
                context_data[k] = v

    history_dicts = [h.model_dump() for h in request.history] if request.history else []
    
    # Call Gemini LLM with CDC context & resilient fallback
    result = call_gemini_api(
        message=request.message,
        context=context_data,
        history=history_dicts
    )

    return ChatResponse(
        reply=result["reply"],
        suggestions=result.get("suggestions", []),
        model=result.get("model", "grow-sense-ai")
    )


@router.get("/suggested-prompts", response_model=List[str])
def get_suggested_prompts(
    domain: Optional[str] = Query(None),
    age_months: Optional[float] = Query(None),
    current_user: User = Depends(require_current_user),
):
    """Returns dynamic quick-ask prompts based on assessment domain and child age."""
    age_str = f"at {int(age_months)} months" if age_months else "at this age"
    
    if domain:
        domain_clean = domain.replace("_", " ").title()
        return [
            f"What are key {domain_clean} milestones {age_str}?",
            f"Suggest playful at-home activities to improve {domain_clean}.",
            f"What are red flags in {domain_clean} to watch out for?",
            "Explain how this milestone is scored."
        ]
        
    return [
        f"What should my child be doing {age_str}?",
        "How can I encourage speech and social skills at home?",
        "My child missed a milestone, should I be worried?",
        "When is the best time to see a pediatrician?"
    ]
