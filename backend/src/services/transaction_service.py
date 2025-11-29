import hashlib
from datetime import datetime, timedelta
from src.core.settings import settings
from src.models.schemas import QuoteResponse

class TransactionService:
    def __init__(self):
        self.api_key = settings.MASUMI_API_KEY

    def create_quote(self, send_amount: float, recipient_country: str) -> QuoteResponse:
        # 1. Get Rate (Calling logic from RateService internally or re-implementing basic logic)
        # For simplicity, using static rates here to avoid circular dependencies
        rates = {"philippines": 52.9, "india": 94.23}
        rate = rates.get(recipient_country.lower(), 1.0)
        
        # 2. Calculate Fees
        fee_percent = 0.5
        fee_amount = send_amount * (fee_percent / 100)
        receive_amount = (send_amount - fee_amount) * rate
        
        quote_id = f"qt_{hashlib.md5(f'{send_amount}{datetime.now()}'.encode()).hexdigest()[:8]}"
        
        return QuoteResponse(
            quote_id=quote_id,
            send_amount=send_amount,
            receive_amount=round(receive_amount, 2),
            exchange_rate=rate,
            fee=fee_amount,
            recipient_country=recipient_country,
            expiry=datetime.utcnow() + timedelta(minutes=15)
        )

    def get_status(self, tx_id: str) -> dict:
        # Mock status check
        return {
            "tx_id": tx_id,
            "status": "processing",
            "confirmations": 2,
            "explorer_url": f"https://preview.cardanoscan.io/transaction/{tx_id}"
        }