"""
Chat Agent for RemitAI
CrewAI-powered agent for handling user queries about remittances
"""

from crewai import Agent
from crewai.tools import tool
from typing import Dict, Any
import requests


class ChatAgent:
    """CrewAI agent for handling remittance-related queries"""

    def __init__(self):
        self.agent = Agent(
            role="Remittance Assistant",
            goal="Help users with remittance queries, provide exchange rates, calculate fees, estimate delivery times, and check transaction status",
            backstory="""You are an expert remittance assistant specializing in Cardano-based international money transfers.
            You have deep knowledge of cryptocurrency exchange rates, remittance fees, delivery times across different countries,
            and transaction tracking. You always provide accurate, helpful information and guide users through their remittance needs.""",
            tools=[
                self.get_live_exchange_rate,
                self.calculate_remittance_fee,
                self.estimate_delivery_time,
                self.check_transaction_status,
            ],
            verbose=True,
        )

    @tool("Get Live Exchange Rate")
    def get_live_exchange_rate(self, target_currency: str) -> Dict[str, Any]:
        """Fetches the real-time ADA price against a target currency."""
        try:
            url = f"https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies={target_currency.lower()}"
            response = requests.get(url, timeout=10)
            response.raise_for_status()

            data = response.json()
            ada_price = data.get("cardano", {}).get(target_currency.lower())

            if ada_price:
                return {
                    "success": True,
                    "ada_price": ada_price,
                    "target_currency": target_currency.upper(),
                    "source": "CoinGecko",
                }
            else:
                return self._get_fallback_rate(target_currency)

        except Exception as e:
            return self._get_fallback_rate(target_currency)

    @tool("Calculate Remittance Fee")
    def calculate_remittance_fee(self, amount: float) -> Dict[str, Any]:
        """Calculates the transaction fee estimate for a remittance amount."""
        base_fee_percent = 0.01  # 1%
        network_fee_ada = 0.5

        base_fee = amount * base_fee_percent
        total_fee = base_fee + network_fee_ada

        return {
            "send_amount": amount,
            "base_fee_percent": base_fee_percent * 100,
            "base_fee_ada": base_fee,
            "network_fee_ada": network_fee_ada,
            "total_fee_ada": total_fee,
            "receive_amount": amount - total_fee,
            "fee_structure": "1% base fee + 0.5 ADA network fee",
        }

    @tool("Estimate Delivery Time")
    def estimate_delivery_time(self, country: str) -> Dict[str, Any]:
        """Provides an estimated time for the remittance to arrive."""
        delivery_times = {
            "philippines": {
                "min_hours": 1,
                "max_hours": 24,
                "description": "Usually within 1-24 hours",
            },
            "vietnam": {
                "min_hours": 2,
                "max_hours": 48,
                "description": "Usually within 2-48 hours",
            },
            "india": {
                "min_hours": 1,
                "max_hours": 24,
                "description": "Usually within 1-24 hours",
            },
            "mexico": {
                "min_hours": 4,
                "max_hours": 72,
                "description": "Usually within 4-72 hours",
            },
            "kenya": {
                "min_hours": 6,
                "max_hours": 96,
                "description": "Usually within 6-96 hours",
            },
        }

        country_lower = country.lower()
        if country_lower in delivery_times:
            estimate = delivery_times[country_lower]
            return {
                "country": country,
                "estimated_delivery": estimate,
                "note": "Delivery times are estimates and may vary based on local banking hours and regulations",
            }
        else:
            return {
                "country": country,
                "estimated_delivery": {
                    "min_hours": 4,
                    "max_hours": 96,
                    "description": "Usually within 4-96 hours (estimate for this country)",
                },
                "note": "Delivery time estimate for this country. Please check local regulations.",
            }

    @tool("Check Transaction Status")
    def check_transaction_status(self, transaction_id: str) -> Dict[str, Any]:
        """A placeholder tool that can respond to 'Where is my money?' questions."""
        if any(char.isdigit() for char in transaction_id):
            mock_statuses = ["pending", "processing", "completed", "failed"]
            status_index = hash(transaction_id) % len(mock_statuses)
            status = mock_statuses[status_index]

            status_messages = {
                "pending": "Your transaction is pending confirmation on the Cardano blockchain.",
                "processing": "Your transaction is being processed by our remittance partner.",
                "completed": "Your transaction has been completed successfully!",
                "failed": "Your transaction failed. Please contact support for assistance.",
            }

            return {
                "transaction_id": transaction_id,
                "status": status,
                "message": status_messages[status],
                "timestamp": "2024-11-18T10:30:00Z",
                "blockchain_tx": f"0x{hash(transaction_id) % 1000000:06x}"
                if status != "failed"
                else None,
            }
        else:
            return {
                "transaction_id": transaction_id,
                "status": "not_found",
                "message": "Transaction ID not found. Please check your transaction ID and try again.",
                "suggestions": [
                    "Verify the transaction ID is correct",
                    "Check your email for the transaction confirmation",
                    "Contact support if you continue having issues",
                ],
            }

    def _get_fallback_rate(self, target_currency: str) -> Dict[str, Any]:
        """Fallback exchange rates when API is unavailable"""
        fallback_rates = {
            "eur": 0.85,
            "usd": 0.92,
            "php": 52.50,
            "inr": 78.25,
            "vnd": 23500,
            "mxn": 18.50,
            "kes": 120.0,
        }

        rate = fallback_rates.get(target_currency.lower(), 1.0)
        return {
            "success": False,
            "ada_price": rate,
            "target_currency": target_currency.upper(),
            "source": "Fallback Rate",
            "note": "Real-time rate unavailable, using fallback rate",
        }

    def execute(self, user_query: str) -> Dict[str, Any]:
        """Execute the agent with a user query"""
        try:
            # In a real CrewAI setup, this would call crew.kickoff()
            # For now, we'll simulate the agent response
            return {
                "query": user_query,
                "response": f"I understand you're asking about: {user_query}. As a remittance assistant, I can help you with exchange rates, fees, delivery times, and transaction status.",
                "agent": "Remittance Assistant",
                "tools_used": [
                    "get_live_exchange_rate",
                    "calculate_remittance_fee",
                    "estimate_delivery_time",
                    "check_transaction_status",
                ],
            }
        except Exception as e:
            return {
                "query": user_query,
                "error": str(e),
                "response": "I'm sorry, I encountered an error processing your request. Please try again.",
            }
