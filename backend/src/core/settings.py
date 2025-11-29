"""
Application Settings
"""

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


class Settings(BaseSettings):
    """
    Config file for system
    """

    model_config = SettingsConfigDict(env_file=".env")

    CARDANO_BLOCKFROST_API_KEY: str
    CARDANO_NETWORK: str

    # Masumi
    MASUMI_API_KEY: str = ""
    MASUMI_TESTNET: str = ""
    MASUMI_PAYMENT_SERVICE_URL: str = "http://localhost:3000"

    # Wallet
    AGENT_WALLET_ADDRESS: str = ""
    AGENT_WALLET_SIGNING_KEY: str = ""

    # AI Configuration
    # Options: "ollama", "openai", "azure"
    LLM_PROVIDER: str = "ollama" 

    # AI/CrewAI
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL_NAME: str = "gpt-4o"


    # Ollama (Local AI)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"

    # Masumi Protocol (MIP-003)
    # The URL of the local payment service (docker container)
    PAYMENT_SERVICE_URL: str = "http://localhost:3000/api/v1"
    PAYMENT_API_KEY: str = "dev-key" # Set this in the payment service env too
    
    # Your Agent's Identity on Masumi Network
    AGENT_IDENTIFIER: str = "remit-ai-agent-v1"
    SELLER_VKEY: str = "" # Your wallet verification key for receiving funds
    
    # Cardano
    CARDANO_NETWORK: str = "prepoad" # preprod / preview / mainnet

    BLOCKFROST_API_KEY_PREPROD: str = ""
    ENCRYPTION_KEY: str = ""
    ADMIN_KEY: str = ""
    OPENROUTER_API_KEY:str = ""
    GEMINI_API_KEY:str= ""
    HOME:str="/tmp"



settings = Settings()
