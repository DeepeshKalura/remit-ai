from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

from enum import Enum

class RelationshipType(str, Enum):
    FAMILY = "family"
    FRIEND = "friend"
    BUSINESS = "business"
    OTHER = "other"

class UserRelationship(BaseModel):
    related_user_id: int
    relation_name: str  # e.g., "Sister", "Boss", "Landlord"
    type: RelationshipType

# --- User Schemas ---
class User(BaseModel):
    id: int
    name: str
    country: str
    wallet: str
    currency: str
    match_score: Optional[int] = None
    tags: List[str] = []  
    relationships: List[UserRelationship] = [] 

class UserSearchResponse(BaseModel):
    users: List[User]
    query: str

# --- Rate Schemas ---
class ExchangeRate(BaseModel):
    pair: str
    rate: float
    source: str
    fee_percent: float
    last_updated: datetime

class RateAnalysisRequest(BaseModel):
    pair: str
    amount: float

# --- Transaction Schemas ---
class QuoteRequest(BaseModel):
    send_amount: float
    recipient_country: str

class QuoteResponse(BaseModel):
    quote_id: str
    send_amount: float
    receive_amount: float
    exchange_rate: float
    fee: float
    recipient_country: str
    expiry: datetime

class ChatRequest(BaseModel):
    conversation_id: str = "default" 
    user_id: int 
    message: str
    context: Optional[Dict[str, Any]] = None