from functools import lru_cache
from src.services.user_service import UserService
from src.services.rate_service import RateService
from src.services.transaction_service import TransactionService
from src.agents.remit_agent import RemitAgentManager

# LRU Cache ensures we create these objects only once (Singleton)
@lru_cache()
def get_user_service() -> UserService:
    return UserService()

@lru_cache()
def get_rate_service() -> RateService:
    return RateService()

@lru_cache()
def get_transaction_service() -> TransactionService:
    return TransactionService()

@lru_cache()
def get_agent_manager() -> RemitAgentManager:
    return RemitAgentManager()