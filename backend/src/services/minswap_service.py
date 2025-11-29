import httpx
from typing import Dict, Any, List, Optional
from datetime import datetime

class MinswapService:
    """
    Service to interact with Minswap Aggregator API.
    """
    BASE_URL = "https://agg-api.minswap.org/aggregator"

    async def get_ada_price(self, currency: str = "usd") -> Dict[str, Any]:
        """
        Get current ADA price in multiple currencies.
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/ada-price",
                params={"currency": currency}
            )
            response.raise_for_status()
            return response.json()

    async def get_wallet_balance(self, address: str, amount_in_decimal: bool = True) -> Dict[str, Any]:
        """
        Query wallet balances and token information.
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/wallet",
                params={
                    "address": address,
                    "amount_in_decimal": str(amount_in_decimal).lower()
                }
            )
            response.raise_for_status()
            return response.json()

    async def search_tokens(
        self, 
        query: str, 
        only_verified: bool = True, 
        assets: Optional[List[str]] = None,
        search_after: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Search and filter token information with pagination.
        """
        payload = {
            "query": query,
            "only_verified": only_verified
        }
        if assets:
            payload["assets"] = assets
        if search_after:
            payload["search_after"] = search_after

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/tokens",
                json=payload
            )
            response.raise_for_status()
            return response.json()

    async def estimate_swap(
        self,
        amount: str,
        token_in: str,
        token_out: str,
        slippage: float = 0.5,
        amount_in_decimal: bool = True,
        allow_multi_hops: bool = True
    ) -> Dict[str, Any]:
        """
        Get optimal swap route and price estimation across DEX protocols.
        """
        payload = {
            "amount": amount,
            "token_in": token_in,
            "token_out": token_out,
            "slippage": slippage,
            "allow_multi_hops": allow_multi_hops,
            "amount_in_decimal": amount_in_decimal
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/estimate",
                json=payload
            )
            response.raise_for_status()
            return response.json()

    async def build_transaction(
        self,
        sender: str,
        estimate: Dict[str, Any],
        min_amount_out: str,
        amount_in_decimal: bool = True
    ) -> Dict[str, Any]:
        """
        Build unsigned swap transaction.
        """
        payload = {
            "sender": sender,
            "min_amount_out": min_amount_out,
            "estimate": estimate,
            "amount_in_decimal": amount_in_decimal
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/build-tx",
                json=payload
            )
            response.raise_for_status()
            return response.json()

    async def submit_transaction(self, cbor: str, witness_set: str) -> Dict[str, Any]:
        """
        Submit signed transaction to network.
        """
        payload = {
            "cbor": cbor,
            "witness_set": witness_set
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/finalize-and-submit-tx",
                json=payload
            )
            response.raise_for_status()
            return response.json()
