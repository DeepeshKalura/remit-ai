from crewai.tools import tool
from src.services.user_service import UserService
from src.services.rate_service import RateService
from src.services.transaction_service import TransactionService

# Instantiate services
user_service = UserService()
rate_service = RateService()
tx_service = TransactionService()

class RemitTools:
    
    @tool("Search Users")
    def search_users(name: str):
        """Useful for finding a user's details, wallet address, or location by their name."""
        return user_service.search_by_name(name)

    @tool("Get Exchange Rate")
    def get_exchange_rate(target_country: str):
        """Useful for getting the current ADA exchange rate for a specific country."""
        # Defaulting source to ADA for simplicity in tool
        return rate_service.get_exchange_rate("ADA", target_country).model_dump()

    @tool("Create Quote")
    def create_quote(send_amount: float, country: str):
        """Useful for calculating fees and final receive amount for a remittance."""
        return tx_service.create_quote(send_amount, country).model_dump()