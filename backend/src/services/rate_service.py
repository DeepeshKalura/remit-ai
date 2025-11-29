from datetime import datetime
from src.models.schemas import ExchangeRate

class RateService:
    def get_exchange_rate(self, source_currency: str, target_country: str) -> ExchangeRate:
        """
        Logic to get rates from DEX or Oracle.
        Currently MOCK implementation.
        """
        # Map country to currency
        country_map = {
            "philippines": "PHP",
            "india": "INR",
            "vietnam": "VND",
            "mexico": "MXN",
            "kenya": "KES"
        }
        
        target_currency = country_map.get(target_country.lower(), "USD")
        pair = f"{source_currency}/{target_currency}"
        
        # Mock Rates
        rates_db = {
            "ADA/PHP": 52.9,
            "ADA/INR": 94.23,
            "ADA/VND": 25565.0,
            "ADA/MXN": 17.85,
            "ADA/KES": 129.5
        }
        
        rate_val = rates_db.get(pair, 1.12) # Default fallback
        
        return ExchangeRate(
            pair=pair,
            rate=rate_val,
            source="Minswap (Aggregated)",
            fee_percent=0.5,
            last_updated=datetime.utcnow()
        )

    def analyze_dex_liquidity(self, pair: str) -> dict:
        """
        Simulate checking liquidity pools
        """
        return {
            "pair": pair,
            "best_dex": "Minswap",
            "minswap_liquidity": "12.5M ADA",
            "sundaeswap_liquidity": "8.2M ADA",
            "recommendation": "Use Minswap for transactions > 1000 ADA"
        }