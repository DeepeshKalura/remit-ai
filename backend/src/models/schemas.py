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

# --- Rater Service Schemas ---
class ProviderRating(BaseModel):
    """Rating for a remittance provider"""
    provider_name: str
    reliability_score: float  # 0-100
    speed_score: float        # 0-100
    cost_score: float         # 0-100
    overall_rating: float     # 0-5 stars
    reviews_count: int
    average_time_hours: float
    
class RouteRating(BaseModel):
    """Rating for a specific remittance route (e.g., USD->INR)"""
    route_id: str
    from_currency: str
    to_currency: str
    from_country: str
    to_country: str
    liquidity_score: float    # 0-100
    speed_rating: float       # 0-5
    cost_rating: float        # 0-5
    reliability_rating: float # 0-5
    total_volume_24h: float
    average_rate: float
    best_providers: List[str] = []
    
class TransactionRating(BaseModel):
    """Rating for a completed/potential transaction"""
    transaction_id: Optional[str] = None
    amount: float
    from_currency: str
    to_currency: str
    provider: str
    estimated_time_hours: float
    fee_percentage: float
    total_cost: float
    rate_quality_score: float # 0-100 (compared to market)
    recommended: bool
    risk_level: str = "low"   # low, medium, high
    
class RateRequest(BaseModel):
    """Request to rate a remittance route or transaction"""
    from_currency: str
    to_currency: str
    amount: float
    from_country: Optional[str] = None
    to_country: Optional[str] = None
    preferred_speed: Optional[str] = "normal"  # fast, normal, economy
    
class RateResponse(BaseModel):
    """Response containing ratings and recommendations"""
    route_rating: RouteRating
    recommended_providers: List[ProviderRating]
    alternative_routes: List[RouteRating] = []
    best_transaction: TransactionRating
    timestamp: datetime