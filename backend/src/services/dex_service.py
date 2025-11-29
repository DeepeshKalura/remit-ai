import requests
from typing import Dict, Any

class DexService:
    BASE_URL = "https://agg-api.minswap.org/aggregator"
    
    # Token Constants (Mainnet Policy IDs for Pricing)
    TOKEN_ADA = "lovelace"
    TOKEN_IUSD = "f66d78b4a3cb3d37afa0ec36461e51ecbde00f26c8f0a68f94b6988069555344" 

    def get_ada_to_stable_quote(self, amount_ada: float) -> Dict[str, Any]:
        """
        Gets a real liquidity quote from Minswap Aggregator.
        """
        try:
            # Convert ADA to Lovelace
            amount_lovelace = int(amount_ada * 1_000_000)
            
            payload = {
                "amount": str(amount_lovelace),
                "token_in": self.TOKEN_ADA,
                "token_out": self.TOKEN_IUSD,
                "slippage": 1.0, # 1% slippage tolerance
                "amount_in_decimal": False 
            }
            
            headers = {"Content-Type": "application/json"}
            
            # Timeout set to 5s to prevent hanging your agent
            response = requests.post(
                f"{self.BASE_URL}/estimate", 
                json=payload, 
                headers=headers,
                timeout=5
            )
            response.raise_for_status()
            data = response.json()
            
            # Parse Math (iUSD has 6 decimals)
            amount_out_raw = int(data.get("amount_out", 0))
            amount_out_decimal = amount_out_raw / 1_000_000
            
            min_amount_raw = int(data.get("min_amount_out", 0))
            min_amount_decimal = min_amount_raw / 1_000_000

            # Extract routing info for transparency
            protocols = set()
            for path in data.get("paths", []):
                for hop in path:
                    protocols.add(hop.get("protocol", "Unknown"))

            return {
                "success": True,
                "input_ada": amount_ada,
                "estimated_iusd": amount_out_decimal,
                "minimum_iusd": min_amount_decimal,
                "price_impact_percent": data.get("avg_price_impact", 0),
                "protocols_used": list(protocols), # e.g. ["MinswapV2", "WingRiders"]
                "fees_ada": "Included in quote"
            }

        except Exception as e:
            # Graceful error handling so the Agent doesn't crash
            return {
                "success": False,
                "error": str(e),
                "fallback_rate": 0.35 # Conservative fallback
            }

    def get_market_rate(self) -> float:
        """
        Helper to get just the simple 1 ADA price
        """
        quote = self.get_ada_to_stable_quote(1.0)
        if quote["success"]:
            return quote["estimated_iusd"]
        return 0.35