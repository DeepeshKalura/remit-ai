from functools import lru_cache
from src.services.dex_service import DexService
from src.services.user_service import UserService
from src.services.rater_service import RaterService


@lru_cache()
def get_user_service() -> UserService:
    return UserService()


@lru_cache()
def get_dex_service() -> DexService:
   return DexService()


@lru_cache()
def get_rater_service() -> RaterService:
    return RaterService()
