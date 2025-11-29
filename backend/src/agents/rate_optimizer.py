"""
Rate Optimizer Agent
Finds optimal routing for remittances using CrewAI
"""

from crewai import Agent
from datetime import datetime


class RateOptimizerAgent:
    def __init__(self):
        self.agent = Agent(
            role="Remittance Route Optimizer",
            goal="Find the most cost-effective and fastest route for international remittances",
            backstory="Veteran in international payments optimization. Balances speed, cost, and compliance.",
        )

    def optimize_route(
        self, send_amount: float, recipient_country: str, sender_wallet: str
    ) -> dict:
        """
        Find optimal remittance route

        Args:
            send_amount: Amount in ADA to send
            recipient_country: Destination country code
            sender_wallet: Sender's Cardano wallet address

        Returns:
            Optimized remittance route with fees and timeline
        """

        exchange_rates = {
            "philippines": 52.9,
            "vietnam": 25565,
            "india": 94.23,
            "mexico": 17.85,
            "kenya": 129.5,
        }

        rate = exchange_rates.get(recipient_country, 1.0)
        fee_percent = 0.5
        processing_time_mins = 2

        fee_amount = send_amount * (fee_percent / 100)
        net_amount = send_amount - fee_amount
        receive_amount = net_amount * rate

        return {
            "sender_wallet": sender_wallet,
            "send_amount": send_amount,
            "send_currency": "ADA",
            "recipient_country": recipient_country,
            "receive_amount": round(receive_amount, 2),
            "receive_currency": self._get_currency(recipient_country),
            "exchange_rate": rate,
            "fee_percent": fee_percent,
            "fee_amount": round(fee_amount, 4),
            "processing_time_minutes": processing_time_mins,
            "route": "Cardano > Masumi > Local Bank",
            "status": "optimized",
            "timestamp": datetime.utcnow().isoformat(),
        }

    def _get_currency(self, country: str) -> str:
        """Map country to currency code"""
        currencies = {
            "philippines": "PHP",
            "vietnam": "VND",
            "india": "INR",
            "mexico": "MXN",
            "kenya": "KES",
        }
        return currencies.get(country, "USD")

    def execute(
        self, send_amount: float, recipient_country: str, sender_wallet: str
    ) -> dict:
        """Execute route optimization"""
        return self.optimize_route(send_amount, recipient_country, sender_wallet)
