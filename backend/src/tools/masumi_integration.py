"""
Masumi Integration
Handles testnet remittance service integration
"""

import os


class MasumiIntegration:
    def __init__(self):
        self.api_key = os.getenv("MASUMI_API_KEY")
        self.base_url = "https://testnet.masumi.io/api/v1"

    def create_quote(self, send_amount: float, recipient_country: str) -> dict:
        """Create quote for remittance"""
        exchange_rates = {
            "philippines": 52.9,
            "vietnam": 25565,
            "india": 94.23,
            "mexico": 17.85,
            "kenya": 129.5,
        }

        rate = exchange_rates.get(recipient_country, 1.0)
        fee_percent = 0.5
        fee = send_amount * (fee_percent / 100)
        receive_amount = (send_amount - fee) * rate

        return {
            "quote_id": f"quote_{hash(str(send_amount) + recipient_country)}",
            "send_amount": send_amount,
            "receive_amount": round(receive_amount, 2),
            "exchange_rate": rate,
            "fee": round(fee, 4),
            "fee_percent": fee_percent,
            "expires_in": 300,
            "status": "valid",
        }

    def initiate_transfer(self, quote_id: str, recipient_phone: str) -> dict:
        """Initiate testnet transfer"""
        return {
            "transfer_id": f"masumi_transfer_{hash(quote_id)}",
            "quote_id": quote_id,
            "recipient_phone": recipient_phone,
            "status": "pending_payment",
            "created_at": "2024-11-07T12:00:00Z",
        }

    def check_transfer_status(self, transfer_id: str) -> dict:
        """Check status of remittance"""
        return {
            "transfer_id": transfer_id,
            "status": "completed",
            "completed_at": "2024-11-07T12:02:00Z",
        }
