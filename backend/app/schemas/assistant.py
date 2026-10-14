from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'/'model'")
    content: str


class ChatContext(BaseModel):
    child_name: Optional[str] = None
    age_months: Optional[float] = None
    gender: Optional[str] = None
    current_domain: Optional[str] = None
    current_question: Optional[str] = None
    latest_scores: Optional[Dict[str, Any]] = None
    status: Optional[str] = None


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    child_id: Optional[int] = None
    context: Optional[ChatContext] = None
    history: Optional[List[ChatMessage]] = Field(default_factory=list, max_length=20)



class ChatResponse(BaseModel):
    reply: str
    suggestions: List[str] = Field(default_factory=list)
    model: str
