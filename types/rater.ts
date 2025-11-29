// TypeScript types matching Python Pydantic models from backend

export interface ProviderRating {
    provider_name: string;
    reliability_score: number;
    speed_score: number;
    cost_score: number;
    overall_rating: number;
    reviews_count: number;
    average_time_hours: number;
}

export interface RouteRating {
    route_id: string;
    from_currency: string;
    to_currency: string;
    from_country: string;
    to_country: string;
    liquidity_score: number;
    speed_rating: number;
    cost_rating: number;
    reliability_rating: number;
    total_volume_24h: number;
    average_rate: number;
    best_providers: string[];
}

export interface TransactionRating {
    transaction_id?: string;
    amount: number;
    from_currency: string;
    to_currency: string;
    provider: string;
    estimated_time_hours: number;
    fee_percentage: number;
    total_cost: number;
    rate_quality_score: number;
    recommended: boolean;
    risk_level: string;
}

export interface RateRequest {
    from_currency: string;
    to_currency: string;
    amount: number;
    from_country?: string;
    to_country?: string;
    preferred_speed?: string;
}

export interface RateResponse {
    route_rating: RouteRating;
    recommended_providers: ProviderRating[];
    alternative_routes: RouteRating[];
    best_transaction: TransactionRating;
    timestamp: string;
}
