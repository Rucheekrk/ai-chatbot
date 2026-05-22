from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    session_id: str
    message: str
    business: str

class ChatResponse(BaseModel):
    text: str
    card: Optional[dict] = None
