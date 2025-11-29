from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List
from src.models.schemas import User, UserSearchResponse, Payee, PayeeCreate, TagRequest, TagResponse
from src.services.user_service import UserService
from src.dependencies import get_user_service

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("", response_model=List[User])
async def get_all_users(service: UserService = Depends(get_user_service)):
    return service.get_all()

@router.get("/{user_id}", response_model=User)
async def get_user(user_id: int, service: UserService = Depends(get_user_service)):
    user = service.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/wallet/{wallet_address}", response_model=User)
async def get_user_by_wallet(wallet_address: str, service: UserService = Depends(get_user_service)):
    user = service.get_by_wallet(wallet_address)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# --- Payee Endpoints ---

@router.post("/{user_id}/payees", response_model=Payee)
async def create_payee(
    user_id: int,
    payee: PayeeCreate,
    service: UserService = Depends(get_user_service)
):
    """
    Create a Payee. The Description will be auto-converted into AI Tags.
    """
    try:
        return service.add_payee(user_id, payee)
    except ValueError:
        raise HTTPException(status_code=404, detail="User not found")

@router.get("/{user_id}/payees/search", response_model=List[Payee])
async def search_payees(
    user_id: int, 
    q: str, 
    service: UserService = Depends(get_user_service)
):
    """
    Search your payees by Name or Tag (e.g., 'rent', 'sister').
    """
    return service.search_payees(user_id, q)

@router.get("/{user_id}/payees", response_model=List[Payee])
async def get_payees(
    user_id: int,
    service: UserService = Depends(get_user_service)
):
    """
    Get all payees for a user.
    """
    return service.get_payees(user_id)




# --- AI Utility ---

@router.post("/tags/generate", response_model=TagResponse)
async def generate_tags_manually(
    request: TagRequest,
    service: UserService = Depends(get_user_service)
):
    """Test endpoint to see what tags the AI generates for a description."""
    tags = service.generate_tags(request.description)
    return TagResponse(tags=tags, reasoning="Generated via RemitAI LLM")