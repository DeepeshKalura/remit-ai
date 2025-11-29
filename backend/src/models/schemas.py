from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- User Schemas ---
class User(BaseModel):
    id: int
    name: str
    country: str
    wallet: str
    currency: str
    match_score: Optional[int] = None

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
    message: str
    context: Optional[Dict[str, Any]] = None