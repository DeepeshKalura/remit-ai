"""
Market Data Service (The Truth Source)
Fetches real-time crypto and fiat exchange rates.
"""

import requests
import time
from typing import Dict, Optional

class MarketDataService:
    def __init__(self):
        self.base_url = "https://api.coingecko.com/api/v3"
        # Simple cache: { "currency_pair": { "rate": 1.23, "timestamp": 1234567890 } }
        self._cache = {}
        self.CACHE_DURATION = 60  # Cache rates for 60 seconds

    def get_ada_price(self, target_currency: str = "usd") -> float:
        """
        Get the current price of Cardano (ADA) in the target fiat currency.
        """
        target = target_currency.lower()
        cache_key = f"ada_{target}"

        # Check Cache
        if self._is_cache_valid(cache_key):
            print(f"[MarketData] Returning cached rate for {cache_key}")
            return self._cache[cache_key]["rate"]

        try:
            # Fetch from CoinGecko
            print(f"[MarketData] Fetching live rate for ADA/{target.upper()}...")
            url = f"{self.base_url}/simple/price"
            params = {
                "ids": "cardano",
                "vs_currencies": target
            }
            response = requests.get(url, params=params, timeout=5)
            response.raise_for_status()
            
            data = response.json()
            rate = data.get("cardano", {}).get(target)
            
            if not rate:
                raise ValueError(f"Rate not found for {target}")

            # Update Cache
            self._cache[cache_key] = {
                "rate": rate,
                "timestamp": time.time()
            }
            
            return rate

        except Exception as e:
            print(f"[MarketData] Error fetching rate: {e}")
            # Fallback logic if API fails (Crucial for reliability)
            return self._get_fallback_rate(target)

    def _is_cache_valid(self, key: str) -> bool:
        if key not in self._cache:
            return False
        age = time.time() - self._cache[key]["timestamp"]
        return age < self.CACHE_DURATION

    def _get_fallback_rate(self, currency: str) -> float:
        """Static fallbacks so the app never crashes during a demo"""
        fallbacks = {
            "usd": 0.35,
            "php": 20.50,
            "inr": 29.50,
            "vnd": 8900.0,
            "mxn": 7.10,
            "kes": 45.0
        }
        return fallbacks.get(currency, 1.0)

# Singleton instance
market_data = MarketDataService()