"""
Application Settings
"""
import sys
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict


# This is a workaround for using ChromaDB on certain systems
try:
    __import__('pysqlite3')
    sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')
except ImportError:
    pass # If pysqlite3 is not installed, continue with the standard sqlite3


class Settings(BaseSettings):
    """
    Config file for the system, loading variables from the environment.
    """

    # Pydantic configuration to look for a .env file
    model_config = SettingsConfigDict(env_file=".env", extra='ignore')

    # --- Cardano Configuration ---
    CARDANO_BLOCKFROST_API_KEY: str
    CARDANO_NETWORK: str = "preprod" # Can be: preprod / preview / mainnet
    BLOCKFROST_API_KEY_PREPROD: str

    # --- Masumi Configuration ---
    MASUMI_API_KEY: str
    MASUMI_TESTNET: bool = True # Use bool for true/false values
    MASUMI_PAYMENT_SERVICE_URL: str
    MASUMI_REGISTRY_SERVICE_URL: str
    ENCRYPTION_KEY: str
    ADMIN_KEY: str

    # --- Agent Wallet Configuration ---
    AGENT_WALLET_ADDRESS: str
    AGENT_WALLET_SIGNING_KEY: str
    
    # --- Agent Identity on Masumi Network (MIP-003) ---
    AGENT_IDENTIFIER: str = "remit-ai-agent-v1"
    SELLER_VKEY: str # Your wallet verification key for receiving funds
    
    # --- Payment Service Configuration ---
    PAYMENT_SERVICE_URL: str
    PAYMENT_API_KEY: str
    
    # --- Default Payment Values ---
    PAYMENT_AMOUNT: str = "1000000"
    PAYMENT_UNIT: str = "lovelace"
    
    # --- AI Provider Configuration ---
    # Options: "ollama", "openai", "openrouter", "gemini"
    LLM_PROVIDER: str = "ollama" 

    # --- API Keys for AI Providers ---
    OPENAI_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    # --- Specific Model Configuration ---
    OPENAI_MODEL_NAME: str = "gpt-4o" # Model to use if LLM_PROVIDER is 'openai'
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3" # Default model if LLM_PROVIDER is 'ollama'


# Create a single instance of the settings to be imported by other parts of the app
settings = Settings()