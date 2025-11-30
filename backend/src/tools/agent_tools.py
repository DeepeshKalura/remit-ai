from crewai.tools import tool
from src.dependencies import get_user_service, get_dex_service

# We get the service instances once to be used by the tool functions
_user_service = get_user_service()
_dex_service = get_dex_service()

class RemitTools:

    @tool("Search My Payees")
    def search_my_payees(query: str, user_id: int) -> str:
        """
        CRITICAL: Use this tool to find one of your saved personal contacts.
        This is how you find the wallet address for people you know, like your sister or landlord.
        
        To use this, you must provide a search query. For example, to find your sister,
        you would provide the query 'sister'.
        
        Args:
            query (str): The search term for the payee (e.g., 'sister', 'rent', 'Dipisha').
            user_id (int): The ID of the current user running the search.
        """
        try:
            # We explicitly pass the user_id here. The agent will get this from its task context.
            payees = _user_service.search_payees(user_id, query)
            if not payees:
                return f"No payee found matching '{query}'. Please check the name or tag."
            # Return a formatted string for the agent to easily understand.
            return f"Found payees: {[p.model_dump_json() for p in payees]}"
        except Exception as e:
            return f"An error occurred while searching for payees: {e}"

    @tool("Get Real DEX Rate")
    def get_ada_to_stable_rate(pair: str = "ADA/iUSD") -> str:
        """
        Fetches the REAL-TIME exchange rate from ADA to iUSD from a Decentralized Exchange (DEX).
        This tells you the current market price for 1 ADA.
        """
        rate = _dex_service.get_market_rate()
        return f"The current rate for {pair} is {rate} based on live DEX data."

    @tool("Swap ADA to Stablecoin")
    def swap_ada_to_stable(amount_ada: float) -> str:
        """
        Calculates a specific swap quote from ADA to iUSD using a Decentralized Exchange (DEX).
        Use this to find out exactly how much Stablecoin the user will receive for a specific amount of ADA.
        """
        quote = _dex_service.get_ada_to_stable_quote(amount_ada)
        
        if quote.get("success"):
            return (
                f"Quote successful: For {quote['input_ada']} ADA, you will receive an estimated "
                f"{quote['estimated_iusd']:.6f} iUSD. The minimum you are guaranteed to receive is "
                f"{quote['minimum_iusd']:.6f} iUSD. This transaction will be routed through the following protocols: "
                f"{quote['protocols_used']}."
            )
        else:
            return (
                f"Error getting quote: {quote.get('error')}. A fallback estimate suggests you would get "
                f"around {amount_ada * quote.get('fallback_rate')} iUSD."
            )