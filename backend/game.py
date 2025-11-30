# register_agent.py (FINAL, HARDCODED VERSION)

import asyncio
from masumi import Config, Agent
from loguru import logger

async def main():
    """
    This script registers your agent with the Masumi network one time
    to get an official AGENT_IDENTIFIER.
    """
    
    # --- HARDCODED CONFIGURATION ---
    # Per your request, all values are directly in this script.
    
    PAYMENT_URL = "https://masumi-payment-service-production-9870.up.railway.app/api/v1"
    REGISTRY_URL = "https://registry.masumi.network/api/v1"
    API_KEY = "ZCF1WN/pJR4s2s6hQ7Y0"
    SELLER_VKEY = "addr_test1qq8dglxq9qwaww5gz3pgzr7qjqsdm7l0m43rwha9urfy3z7enjwmwptulnwdq2h9czlxz7hg7a04h772mxepgyvj9g4qv4u6jq"

    logger.info(f"Attempting to register agent with registry: {REGISTRY_URL}")
    
    # 1. Configure the Masumi SDK
    config = Config(
        registry_service_url=REGISTRY_URL,
        registry_api_key=API_KEY,
        payment_service_url=PAYMENT_URL, # THIS WAS THE URL MISSING THE /api/v1 path
        payment_api_key=API_KEY
    )

    # 2. Define the Agent's metadata with all required fields
    agent = Agent(
        name="RemitAI Agent",
        config=config,
        description="AI agent for remittance optimization and planning.",
        api_base_url="https://remit-ai-backend-api.azurewebsites.net/api/masumi", 
        
        author_name="Deepesh Kalura",
        author_contact="deepeshkalurs@gmail.com",
        author_organization="RemitAI Project",

        capability_name="remittance-planning",
        capability_version="1.0.0",
        tags=["finance", "remittance", "cardano", "ai", "planning"],
        
        pricing_unit="lovelace",
        pricing_quantity="1000000",
        
        network="Preprod",
        
        example_output=[
            {
                "name": "sample_transaction_plan",
                "url": "https://remit-ai-backend-api.azurewebsites.net/example_output.json",
                "mimeType": "application/json"
            }
        ],
        legal_privacy_policy="https://remit-ai.com/privacy",
        legal_terms="https://remit-ai.com/terms",
        legal_other="https://remit-ai.com/legal"
    )
    
    # 3. Perform the registration
    try:
        logger.info("Sending registration request...")
        result = await agent.register()
        
        if result and result.get("success"):
            agent_identifier = result["data"]["agentIdentifier"]
            logger.success("--- REGISTRATION SUCCESSFUL ---")
            print(f"\n✅ Your official AGENT_IDENTIFIER is: {agent_identifier}\n")
            print("--> ACTION REQUIRED: Copy this value and update the AGENT_IDENTIFIER in your .env file!")
        else:
            logger.error(f"Registration failed. Response from server: {result}")

    except Exception as e:
        logger.error(f"An unexpected error occurred during registration: {e}")
        logger.error("Please check your API key and that the services are online.")


if __name__ == "__main__":
    asyncio.run(main())