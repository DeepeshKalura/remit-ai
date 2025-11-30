import httpx
import sys
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel
from loguru import logger

from src.models.schemas import (
    RateRequest,
    RateResponse,
    ProviderRating,
    RouteRating,
    TransactionRating
)

# --- Loguru Configuration ---
logger.remove()
logger.add(
    sys.stdout, colorize=True,
    format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"
)

# --- Helper Model ---
class TransactionMetrics(BaseModel):
    provider_name: str
    true_cost_usd: float
    estimated_time_hours: float
    reliability: float

class RaterService:
    MINSWAP_BASE_URL = "https://agg-api.minswap.org/aggregator"
    BINANCE_API_URL = "https://api.binance.com/api/v3/ticker/price"

    def __init__(self):
        logger.info("RaterService initialized.")

    # --- Scoring Algorithms (Unchanged) ---
    def _calculate_relative_score(self, value: float, best_value: float, lower_is_better: bool = True) -> float:
        if best_value == 0: return 1.0
        ratio = value / best_value
        if lower_is_better:
            if ratio <= 1.05: return 5.0;
            if ratio <= 1.20: return 4.0;
            if ratio <= 1.50: return 3.0;
            if ratio <= 2.00: return 2.0;
            return 1.0
        else:
            if ratio >= 0.98: return 5.0;
            if ratio >= 0.95: return 4.0;
            if ratio >= 0.90: return 3.0;
            return 2.0

    def _calculate_overall_score(self, cost: float, speed: float, reliability: float) -> float:
        return round((cost * 0.4) + (speed * 0.3) + (reliability * 0.3), 1)

    # --- Data Fetching (Unchanged) ---
    async def _fetch_binance_price(self, symbol: str = "ADAUSDT") -> float:
        try:
            async with httpx.AsyncClient() as c:
                r = await c.get(f"{self.BINANCE_API_URL}?symbol={symbol}", timeout=3.0)
                if r.status_code == 200: return float(r.json().get("price", 0.0))
        except Exception: pass
        logger.warning("Could not fetch Binance price, using fallback.")
        return 0.35

    async def _fetch_minswap_estimate(self, amount_ada: float) -> Optional[Dict[str, Any]]:
        payload = { "amount": str(amount_ada), "token_in": "lovelace", "token_out": "f66d78b4a3cb3d37afa0ec36461e51ecbde00f26c8f0a68f94b6988069555344", "slippage": 1.0, "amount_in_decimal": True }
        try:
            async with httpx.AsyncClient() as c:
                r = await c.post(f"{self.MINSWAP_BASE_URL}/estimate", json=payload, timeout=5.0)
                if r.status_code == 200: return r.json()
        except Exception: pass
        logger.warning("Could not fetch Minswap estimate.")
        return None

    # --- CORE RATING ENGINE (Unchanged) ---
    async def get_all_providers(self, reference_amount_ada: float = 1000.0) -> List[ProviderRating]:
        logger.info(f"🏁 Starting provider race for {reference_amount_ada} ADA")
        market_price_ada_usd = await self._fetch_binance_price()
        input_value_usd = reference_amount_ada * market_price_ada_usd
        metrics: List[TransactionMetrics] = []

        # ... (Provider logic remains the same)
        minswap_data = await self._fetch_minswap_estimate(reference_amount_ada)
        if minswap_data:
            output_usd = float(minswap_data.get("amount_out", 0))
            metrics.append(TransactionMetrics(provider_name="MinswapDEX", true_cost_usd=input_value_usd - output_usd, estimated_time_hours=0.08, reliability=5.0))
        
        binance_output_usd = (reference_amount_ada - 1.0) * market_price_ada_usd
        metrics.append(TransactionMetrics(provider_name="Binance", true_cost_usd=input_value_usd - binance_output_usd, estimated_time_hours=0.5, reliability=4.8))

        metrics.append(TransactionMetrics(provider_name="Wise", true_cost_usd=input_value_usd * 0.015, estimated_time_hours=24, reliability=4.5))
        metrics.append(TransactionMetrics(provider_name="MoonPay (Card)", true_cost_usd=input_value_usd * 0.039, estimated_time_hours=0.2, reliability=4.2))

        if not metrics: return []
        best_cost = min(m.true_cost_usd for m in metrics)
        best_speed = min(m.estimated_time_hours for m in metrics)
        
        provider_ratings = []
        for m in metrics:
            cost_score = self._calculate_relative_score(m.true_cost_usd, best_cost)
            speed_score = self._calculate_relative_score(m.estimated_time_hours, best_speed)
            provider_ratings.append(ProviderRating(
                provider_name=m.provider_name, reliability_score=m.reliability, speed_score=speed_score, cost_score=cost_score,
                overall_rating=self._calculate_overall_score(cost_score, speed_score, m.reliability),
                reviews_count=1000, average_time_hours=m.estimated_time_hours
            ))
        
        logger.success("🏆 Provider race complete.")
        return sorted(provider_ratings, key=lambda p: p.overall_rating, reverse=True)

    # --- RESTORED PUBLIC METHODS ---

    async def get_provider_by_name(self, name: str, reference_amount_ada: float = 1000.0) -> Optional[ProviderRating]:
        """
        RESTORED: Gets a single provider's rating by running the race and finding it.
        """
        logger.info(f"Requesting single provider rating for '{name}'.")
        all_providers = await self.get_all_providers(reference_amount_ada)
        for provider in all_providers:
            if provider.provider_name.lower() == name.lower():
                logger.success(f"Found provider '{name}' in race results.")
                return provider
        logger.warning(f"Provider '{name}' not found after running the rating engine.")
        return None

    async def rate_transaction(self, amount: float, from_currency: str, to_currency: str, provider: str) -> Optional[TransactionRating]:
        """
        RESTORED: Calculates a specific transaction for ONE provider.
        """
        logger.info(f"Calculating single transaction for {amount} {from_currency} via {provider}")
        market_price = await self._fetch_binance_price()
        input_value = amount * market_price
        output_value = 0.0

        provider_key = provider.lower()
        if "minswap" in provider_key:
            data = await self._fetch_minswap_estimate(amount)
            if data: output_value = float(data.get("amount_out", 0))
        elif "binance" in provider_key:
            output_value = (amount - 1.0) * market_price
        
        if output_value == 0:
            logger.error(f"Could not calculate output for provider {provider}")
            return None

        true_cost = input_value - output_value
        return TransactionRating(
            transaction_id=f"tx_{provider}_{int(datetime.now().timestamp())}",
            amount=amount, from_currency=from_currency, to_currency=to_currency,
            provider=provider, estimated_time_hours=0.1, risk_level="Low",
            fee_percentage=round((true_cost / input_value) * 100, 2) if input_value > 0 else 0,
            total_cost=round(true_cost, 4), # total_cost now represents the "True Cost"
            rate_quality_score=5.0, # Placeholder
            recommended=True
        )

    async def rate_route(self, from_currency: str, to_currency: str, from_country: str, to_country: str) -> RouteRating:
        """
        RESTORED: Returns a static rating for the general corridor.
        """
        logger.info(f"Rating route for {from_currency} -> {to_currency}")
        return RouteRating(
            route_id=f"{from_currency}-{to_currency}",
            from_currency=from_currency, to_currency=to_currency,
            from_country=from_country, to_country=to_country,
            liquidity_score=4.5, speed_rating=4.5, cost_rating=4.2, reliability_rating=4.8,
            total_volume_24h=500000.0, average_rate=0.35, best_providers=["MinswapDEX", "Binance"]
        )

    async def get_comprehensive_rating(self, request: RateRequest) -> RateResponse:
        """
        ORCHESTRATOR: Now uses the restored methods correctly.
        """
        logger.info("Handling comprehensive rating request...")
        providers = await self.get_all_providers(request.amount)
        if not providers: raise ValueError("Could not get provider ratings.")

        best_tx = await self.rate_transaction(request.amount, request.from_currency, request.to_currency, providers[0].provider_name)
        route = await self.rate_route(request.from_currency, request.to_currency, request.from_country, request.to_country)

        return RateResponse(
            route_rating=route,
            recommended_providers=providers,
            alternative_routes=[],
            best_transaction=best_tx,
            timestamp=datetime.now(timezone.utc)
        )