from crewai.tools import tool
from src.dependencies import get_dex_service, get_user_service


class RemitTools:
    
    @tool("Search Users")
    def search_users(name: str):
        """Useful for finding a user's details, wallet address, or location by their name."""
        return get_user_service().search_by_name(name)
    
    @tool("Get Real DEX Rate")
    def get_ada_to_stable_rate(pair: str = "ADA/iUSD"):
        """
        Fetches the REAL-TIME exchange rate from ADA to iUSD using Minswap Aggregator liquidity.
        """
        service = get_dex_service()
        rate = service.get_market_rate()
        return {
            "pair": pair,
            "rate": rate,
            "source": "Minswap Aggregator (Mainnet Data)"
        }

    @tool("Swap ADA to Stablecoin")
    def swap_ada_to_stable(amount_ada: float):
        """
        Calculates a specific swap quote from ADA to iUSD using Minswap Aggregator.
        Use this to find out exactly how much Stablecoin the user will receive.
        """
        service = get_dex_service()
        quote = service.get_ada_to_stable_quote(amount_ada)
        
        if quote["success"]:
            return {
                "status": "quoted",
                "input_amount": f"{quote['input_ada']} ADA",
                "estimated_output": f"{quote['estimated_iusd']:.6f} iUSD",
                "min_output": f"{quote['minimum_iusd']:.6f} iUSD",
                "price_impact": f"{quote['price_impact_percent']}%",
                "route": quote['protocols_used']
            }
        else:
            return {
                "status": "error",
                "message": quote.get("error"),
                "fallback_estimate": f"{amount_ada * quote.get('fallback_rate')} iUSD"
            }
