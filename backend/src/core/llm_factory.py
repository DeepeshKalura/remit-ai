import os
from crewai import LLM
from src.core.settings import settings

class LLMFactory:
    @staticmethod
    def create_llm():
        """
        Creates a native CrewAI LLM instance.
        """
        provider = settings.LLM_PROVIDER.lower()
        
        if provider == "openai":
            # CrewAI/LiteLLM expects model names like 'gpt-4o'
            return LLM(
                model=settings.OPENAI_MODEL_NAME,
                api_key=settings.OPENAI_API_KEY,
                temperature=0
            )
            
        elif provider == "ollama":
            # For Ollama, CrewAI expects 'ollama/model_name'
            return LLM(
                model=f"ollama/{settings.OLLAMA_MODEL}",
                base_url=settings.OLLAMA_BASE_URL,
                temperature=0.2
            )
        
        if provider == "openrouter":
            return LLM(
                model="tngtech/tng-r1t-chimera:free",
            )
            
        # Add other providers (Azure, Anthropic) here easily
        return LLM(model=f"ollama/{settings.OLLAMA_MODEL}", base_url=settings.OLLAMA_BASE_URL)