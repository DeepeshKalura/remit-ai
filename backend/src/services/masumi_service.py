# /src/services/masumi_service.py

import asyncio
from masumi import Config, Payment
from src.core.settings import settings
from loguru import logger

class MasumiService:
    """A service to interact with the Masumi Payment SDK."""
    def __init__(self):
        self.config = Config(
            registry_service_url=settings.MASUMI_REGISTRY_SERVICE_URL,
            registry_api_key=settings.MASUMI_API_KEY,
            payment_service_url=settings.MASUMI_PAYMENT_SERVICE_URL,
            payment_api_key=settings.PAYMENT_API_KEY
        )
        logger.info("Masumi Service configured.")

    async def verify_payment(self, blockchain_identifier: str) -> bool:
        """
        Verifies if a payment has been confirmed with the Masumi Payment Service.
        
        Args:
            blockchain_identifier: The transaction hash provided as proof of payment.
            
        Returns:
            True if the payment is confirmed, False otherwise.
        """
        if not blockchain_identifier:
            logger.warning("Verification failed: No blockchain_identifier provided.")
            return False

        try:
            payment = Payment(
                agent_identifier=settings.AGENT_IDENTIFIER,
                config=self.config,
                identifier_from_purchaser=blockchain_identifier,
                network=settings.CARDANO_NETWORK
            )
            
            logger.info(f"Checking payment status for tx: {blockchain_identifier}")
            status_result = await payment.check_payment_status()
            logger.debug(f"Masumi payment status response: {status_result}")

            if status_result.get("data", {}).get("status") == "PAID_AND_CONFIRMED":
                logger.success(f"Payment confirmed for tx: {blockchain_identifier}")
                return True
            else:
                logger.warning(f"Payment NOT confirmed for tx: {blockchain_identifier}. Status: {status_result.get('data', {}).get('status')}")
                return False

        except Exception as e:
            logger.error(f"Error during Masumi payment verification for tx {blockchain_identifier}: {e}")
            return False

# Singleton instance for dependency injection
masumi_service = MasumiService()