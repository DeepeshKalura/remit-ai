from functools import lru_cache
from src.services.dex_service import DexService
from src.services.user_service import UserService


from fastapi import Depends
from sqlmodel import Session
from src.core.database import get_session

def get_user_service(session: Session = Depends(get_session)) -> UserService:
    return UserService(session)


@lru_cache()
def get_dex_service() -> DexService:
   return DexService()
