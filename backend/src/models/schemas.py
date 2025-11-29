from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# --- Payee (Recipient) Schemas ---
class Payee(BaseModel):
    id: str
    name: str
    wallet_address: str
    country: str
    currency: str
    tags: List[str] = []
    created_at: str

class PayeeCreate(BaseModel):
    name: str
    wallet_address: str
    country: str
    currency: str
    description: str  # e.g. "Paying rent for my apartment"

# --- User Schemas ---
class User(BaseModel):
    id: int
    name: str
    country: str
    wallet: str
    currency: str
    match_score: Optional[int] = None
    payees: List[Payee] = [] 

class UserSearchResponse(BaseModel):
    users: List[User]
    query: str

# --- AI Tagging Schemas ---
class TagRequest(BaseModel):
    description: str

class TagResponse(BaseModel):
    tags: List[str]
    reasoning: str

# --- Rate/Transaction Schemas (Existing) ---
class ExchangeRate(BaseModel):
    pair: str
    rate: float
    source: str
    fee_percent: float
    last_updated: datetime

class RateAnalysisRequest(BaseModel):
    pair: str
    amount: float

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

# --- Rater Schemas ---
class ProviderRating(BaseModel):
    provider_name: str
    reliability_score: float
    speed_score: float
    cost_score: float
    overall_rating: float
    reviews_count: int
    average_time_hours: float
    
class RouteRating(BaseModel):
    route_id: str
    from_currency: str
    to_currency: str
    from_country: str
    to_country: str
    liquidity_score: float
    speed_rating: float
    cost_rating: float
    reliability_rating: float
    total_volume_24h: float
    average_rate: float
    best_providers: List[str] = []
    
class TransactionRating(BaseModel):
    transaction_id: Optional[str] = None
    amount: float
    from_currency: str
    to_currency: str
    provider: str
    estimated_time_hours: float
    fee_percentage: float
    total_cost: float
    rate_quality_score: float
    recommended: bool
    risk_level: str
    
class RateRequest(BaseModel):
    from_currency: str
    to_currency: str
    amount: float
    from_country: Optional[str] = None
    to_country: Optional[str] = None
    preferred_speed: Optional[str] = "normal"
    
class RateResponse(BaseModel):
    route_rating: RouteRating
    recommended_providers: List[ProviderRating]
    alternative_routes: List[RouteRating] = []
    best_transaction: TransactionRating
    timestamp: datetime