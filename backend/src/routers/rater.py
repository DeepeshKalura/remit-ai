from fastapi import APIRouter, Depends, HTTPException
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

router = APIRouter(prefix="/api/rater", tags=["Rater"])


@router.post("/rate", response_model=RateResponse)
async def get_comprehensive_rate(
    request: RateRequest,
    rater_service: RaterService = Depends(get_rater_service)
):
    """
    Get comprehensive rating for a remittance route including:
    - Route rating (liquidity, speed, cost, reliability)
    - Recommended providers
    - Alternative routes
    - Best transaction option
    """
    try:
        return rater_service.get_comprehensive_rating(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rating failed: {str(e)}")


@router.get("/providers", response_model=List[ProviderRating])
async def get_all_providers(
    rater_service: RaterService = Depends(get_rater_service)
):
    """
    Get ratings for all available remittance providers.
    """
    return rater_service.get_all_providers()


@router.get("/providers/{provider_name}", response_model=ProviderRating)
async def get_provider_rating(
    provider_name: str,
    rater_service: RaterService = Depends(get_rater_service)
):
    """
    Get detailed rating for a specific provider.
    """
    return rater_service.get_provider_by_name(provider_name)


@router.get("/route/{from_currency}/{to_currency}", response_model=RouteRating)
async def get_route_rating(
    from_currency: str,
    to_currency: str,
    from_country: str = "USA",
    to_country: str = "India",
    rater_service: RaterService = Depends(get_rater_service)
):
    """
    Get rating for a specific remittance route.
    """
    return rater_service.rate_route(
        from_currency=from_currency,
        to_currency=to_currency,
        from_country=from_country,
        to_country=to_country
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
    Rate a specific transaction with given parameters.
    """
    return rater_service.rate_transaction(
        amount=amount,
        from_currency=from_currency,
        to_currency=to_currency,
        provider=provider
    )
