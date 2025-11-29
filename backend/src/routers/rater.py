
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from src.models.schemas import (
    RateRequest,
    RateResponse,
    ProviderRating,
    RouteRating,
    TransactionRating
)
from src.services.rater_service import RaterService
from src.dependencies import get_rater_service
from src.core.constant import current_support_for_ada_conversation

router = APIRouter(prefix="/api/rater", tags=["Rater"])

@router.get("/currencies")
async def get_supported_currencies():
    """
    Get list of supported currencies for remittance.
    """
    return {"currencies": current_support_for_ada_conversation}

@router.post("/rate", response_model=RateResponse)
async def get_comprehensive_rate(
    request: RateRequest,
    rater_service: RaterService = Depends(get_rater_service)
):
    """
    Get comprehensive rating: Real DEX data vs Competitor baselines.
    """
    try:
        return await rater_service.get_comprehensive_rating(request)
    except Exception as e:
        # Log error in production
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Rating engine error: {str(e)}"
        )

@router.get("/providers", response_model=List[ProviderRating])
async def get_all_providers(
    rater_service: RaterService = Depends(get_rater_service)
):
    """
    Get ratings for all tracked providers (Real + Baseline).
    """
    return await rater_service.get_all_providers()

@router.get("/providers/{provider_name}", response_model=ProviderRating)
async def get_provider_rating(
    provider_name: str,
    rater_service: RaterService = Depends(get_rater_service)
):
    """
    Get detailed rating for a specific provider.
    """
    provider = await rater_service.get_provider_by_name(provider_name)
    if not provider or provider.overall_rating == 0:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider

@router.get("/route/{from_currency}/{to_currency}", response_model=RouteRating)
async def get_route_rating(
    from_currency: str,
    to_currency: str,
    from_country: str = "USA",
    to_country: str = "India",
    rater_service: RaterService = Depends(get_rater_service)
):
    return await rater_service.rate_route(
        from_currency, to_currency, from_country, to_country
    )

@router.post("/transaction", response_model=TransactionRating)
async def rate_transaction(
    amount: float,
    from_currency: str,
    to_currency: str,
    provider: str = "MinswapDEX",
    rater_service: RaterService = Depends(get_rater_service)
):
    """
    Calculate specific transaction metrics (Fees, Output, Impact).
    """
    return await rater_service.rate_transaction(
        amount=amount,
        from_currency=from_currency,
        to_currency=to_currency,
        provider=provider
    )