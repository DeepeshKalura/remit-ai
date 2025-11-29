from typing import List, Dict, Any
from datetime import datetime, timezone
from src.models.schemas import (
    ProviderRating,
    RouteRating,
    TransactionRating,
    RateRequest,
    RateResponse
)


class RaterService:
    """
    Service for rating remittance routes, providers, and transactions.
    Analyzes liquidity, speed, cost, and reliability to provide recommendations.
    """
    
    def __init__(self):
        # Mock provider database - in production, this would be a real database
        self.providers = {
            "MinswapDEX": {
                "reliability_score": 95.0,
                "speed_score": 85.0,
                "cost_score": 90.0,
                "reviews_count": 1250,
                "average_time_hours": 0.5
            },
            "WingRiders": {
                "reliability_score": 92.0,
                "speed_score": 88.0,
                "cost_score": 87.0,
                "reviews_count": 890,
                "average_time_hours": 0.75
            },
            "SundaeSwap": {
                "reliability_score": 90.0,
                "speed_score": 80.0,
                "cost_score": 85.0,
                "reviews_count": 1100,
                "average_time_hours": 1.0
            },
            "TraditionalBank": {
                "reliability_score": 88.0,
                "speed_score": 60.0,
                "cost_score": 65.0,
                "reviews_count": 5000,
                "average_time_hours": 48.0
            }
        }
        
        # Mock route database
        self.routes = {
            "ADA-IUSD": {
                "liquidity_score": 95.0,
                "total_volume_24h": 1500000.0,
                "average_rate": 0.35
            },
            "USD-INR": {
                "liquidity_score": 88.0,
                "total_volume_24h": 5000000.0,
                "average_rate": 83.5
            },
            "EUR-INR": {
                "liquidity_score": 82.0,
                "total_volume_24h": 3000000.0,
                "average_rate": 90.2
            }
        }
    
    def rate_provider(self, provider_name: str) -> ProviderRating:
        """
        Rate a specific remittance provider.
        """
        provider_data = self.providers.get(provider_name, {
            "reliability_score": 75.0,
            "speed_score": 70.0,
            "cost_score": 70.0,
            "reviews_count": 100,
            "average_time_hours": 24.0
        })
        
        # Calculate overall rating (0-5 scale)
        overall = (
            provider_data["reliability_score"] * 0.4 +
            provider_data["speed_score"] * 0.3 +
            provider_data["cost_score"] * 0.3
        ) / 20  # Convert 100-scale to 5-scale
        
        return ProviderRating(
            provider_name=provider_name,
            reliability_score=provider_data["reliability_score"],
            speed_score=provider_data["speed_score"],
            cost_score=provider_data["cost_score"],
            overall_rating=round(overall, 2),
            reviews_count=provider_data["reviews_count"],
            average_time_hours=provider_data["average_time_hours"]
        )
    
    def rate_route(
        self, 
        from_currency: str, 
        to_currency: str,
        from_country: str = "USA",
        to_country: str = "India"
    ) -> RouteRating:
        """
        Rate a specific remittance route.
        """
        route_key = f"{from_currency}-{to_currency}"
        route_data = self.routes.get(route_key, {
            "liquidity_score": 70.0,
            "total_volume_24h": 100000.0,
            "average_rate": 1.0
        })
        
        # Calculate ratings based on liquidity and volume
        liquidity_score = route_data["liquidity_score"]
        volume = route_data["total_volume_24h"]
        
        # Higher liquidity = better speed and reliability
        speed_rating = min(5.0, (liquidity_score / 20))
        reliability_rating = min(5.0, (liquidity_score / 20))
        
        # Cost rating based on competition (higher volume = more competition = better rates)
        cost_rating = min(5.0, (volume / 1000000) * 2)
        
        # Get best providers for this route
        best_providers = self._get_best_providers_for_route(from_currency, to_currency)
        
        return RouteRating(
            route_id=route_key,
            from_currency=from_currency,
            to_currency=to_currency,
            from_country=from_country,
            to_country=to_country,
            liquidity_score=liquidity_score,
            speed_rating=round(speed_rating, 2),
            cost_rating=round(cost_rating, 2),
            reliability_rating=round(reliability_rating, 2),
            total_volume_24h=volume,
            average_rate=route_data["average_rate"],
            best_providers=best_providers
        )
    
    def rate_transaction(
        self,
        amount: float,
        from_currency: str,
        to_currency: str,
        provider: str = "MinswapDEX"
    ) -> TransactionRating:
        """
        Rate a specific transaction with given parameters.
        """
        provider_rating = self.rate_provider(provider)
        route_key = f"{from_currency}-{to_currency}"
        route_data = self.routes.get(route_key, {"average_rate": 1.0})
        
        # Calculate fees (DEX typically lower than traditional)
        if "DEX" in provider or "Swap" in provider or "Riders" in provider:
            fee_percentage = 0.5  # 0.5% for DEX
        else:
            fee_percentage = 3.0  # 3% for traditional
        
        fee_amount = amount * (fee_percentage / 100)
        total_cost = amount + fee_amount
        
        # Rate quality score (higher provider scores = better rate quality)
        rate_quality_score = (
            provider_rating.reliability_score * 0.4 +
            provider_rating.cost_score * 0.6
        )
        
        # Recommend if rate quality > 85 and cost is reasonable
        recommended = rate_quality_score > 85.0 and fee_percentage < 2.0
        
        # Risk assessment
        if provider_rating.reliability_score > 90:
            risk_level = "low"
        elif provider_rating.reliability_score > 75:
            risk_level = "medium"
        else:
            risk_level = "high"
        
        return TransactionRating(
            transaction_id=None,
            amount=amount,
            from_currency=from_currency,
            to_currency=to_currency,
            provider=provider,
            estimated_time_hours=provider_rating.average_time_hours,
            fee_percentage=fee_percentage,
            total_cost=total_cost,
            rate_quality_score=round(rate_quality_score, 2),
            recommended=recommended,
            risk_level=risk_level
        )
    
    def get_comprehensive_rating(self, request: RateRequest) -> RateResponse:
        """
        Get comprehensive rating with route analysis, provider recommendations,
        and transaction rating.
        """
        # Rate the primary route
        route_rating = self.rate_route(
            request.from_currency,
            request.to_currency,
            request.from_country or "USA",
            request.to_country or "India"
        )
        
        # Get recommended providers (top 3)
        recommended_providers = [
            self.rate_provider(provider) 
            for provider in route_rating.best_providers[:3]
        ]
        
        # Get alternative routes (for demo, showing currency alternatives)
        alternative_routes = []
        if request.from_currency != "EUR":
            alt_route = self.rate_route(
                "EUR",
                request.to_currency,
                "Finland",
                request.to_country or "India"
            )
            alternative_routes.append(alt_route)
        
        # Get best transaction rating (using best provider)
        best_provider = route_rating.best_providers[0] if route_rating.best_providers else "MinswapDEX"
        best_transaction = self.rate_transaction(
            request.amount,
            request.from_currency,
            request.to_currency,
            best_provider
        )
        
        return RateResponse(
            route_rating=route_rating,
            recommended_providers=recommended_providers,
            alternative_routes=alternative_routes,
            best_transaction=best_transaction,
            timestamp=datetime.now(timezone.utc)
        )
    
    def _get_best_providers_for_route(
        self, 
        from_currency: str, 
        to_currency: str
    ) -> List[str]:
        """
        Internal method to determine best providers for a route.
        """
        # For crypto routes, prioritize DEX platforms
        if from_currency in ["ADA", "BTC", "ETH"] or to_currency in ["IUSD", "USDC", "USDT"]:
            return ["MinswapDEX", "WingRiders", "SundaeSwap"]
        
        # For fiat routes, mix of DEX and traditional
        return ["MinswapDEX", "WingRiders", "TraditionalBank"]
    
    def get_all_providers(self) -> List[ProviderRating]:
        """
        Get ratings for all available providers.
        """
        return [self.rate_provider(name) for name in self.providers.keys()]
    
    def get_provider_by_name(self, provider_name: str) -> ProviderRating:
        """
        Get detailed rating for a specific provider.
        """
        return self.rate_provider(provider_name)
