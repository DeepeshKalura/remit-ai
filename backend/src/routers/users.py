from fastapi import APIRouter, Depends, HTTPException
from typing import List
from src.models.schemas import User, UserSearchResponse
from src.services.user_service import UserService
from src.dependencies import get_user_service

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("", response_model=List[User])
async def get_all_users(
    service: UserService = Depends(get_user_service)
):
    return service.get_all()

@router.get("/search/{name}", response_model=UserSearchResponse)
async def search_users(
    name: str, 
    service: UserService = Depends(get_user_service)
):
    results = service.search_by_name(name)
    return UserSearchResponse(users=results, query=name)

@router.get("/{user_id}", response_model=User)
async def get_user(
    user_id: int, 
    service: UserService = Depends(get_user_service)
):
    user = service.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user