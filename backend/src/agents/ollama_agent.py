"""
Ollama Agent Integration
Wraps Ollama API for local AI inference compatible with CrewAI
"""

import ollama
from typing import Optional, Dict, Any
import os


class OllamaAgent:
    """
    Ollama-powered agent for local AI inference
    Compatible with Masumi Protocol (MIP-003)
    """
    
    def __init__(
        self,
        base_url: Optional[str] = None,
        model: Optional[str] = None
    ):
        """
        Initialize Ollama agent
        
        Args:
            base_url: Ollama server URL (default: http://localhost:11434)
            model: Model to use (default: llama3.2)
        """
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.model = model or os.getenv("OLLAMA_MODEL", "llama3.2")
        self.client = ollama.Client(host=self.base_url)
    
    def chat(
        self,
        message: str,
        context: Optional[Dict[str, Any]] = None,
        system_prompt: Optional[str] = None
    ) -> str:
        """
        Chat with the Ollama model
        
        Args:
            message: User message
            context: Additional context (user data, transaction info, etc.)
            system_prompt: Optional system prompt override
        
        Returns:
            Agent's response
        """
        # Build system prompt
        default_system = """You are a helpful remittance assistant powered by Masumi Protocol on Cardano blockchain.
You help users with:
- Finding recipient information
- Getting exchange rates and quotes
- Initiating transfers
- Checking transfer status

Be concise, friendly, and helpful. When you have user information available, use it to personalize responses."""
        
        system = system_prompt or default_system
        
        # Build context message
        context_msg = ""
        if context:
            context_msg = f"\n\nContext: {context}"
        
        messages = [
            {"role": "system", "content": system},
            {"role": "user", "content": message + context_msg}
        ]
        
        try:
            response = self.client.chat(
                model=self.model,
                messages=messages
            )
            return response['message']['content']
        except Exception as e:
            print(f"[OllamaAgent] Error: {e}")
            return f"I'm having trouble connecting to the AI service. Error: {str(e)}"
    
    def stream_chat(
        self,
        message: str,
        context: Optional[Dict[str, Any]] = None,
        system_prompt: Optional[str] = None
    ):
        """
        Stream chat response (for real-time UI updates)
        
        Args:
            message: User message
            context: Additional context
            system_prompt: Optional system prompt override
        
        Yields:
            Response chunks
        """
        default_system = """You are a helpful remittance assistant powered by Masumi Protocol on Cardano blockchain."""
        
        system = system_prompt or default_system
        
        context_msg = ""
        if context:
            context_msg = f"\n\nContext: {context}"
        
        messages = [
            {"role": "system", "content": system},
            {"role": "user", "content": message + context_msg}
        ]
        
        try:
            for chunk in self.client.chat(
                model=self.model,
                messages=messages,
                stream=True
            ):
                yield chunk['message']['content']
        except Exception as e:
            print(f"[OllamaAgent] Stream error: {e}")
            yield f"Error: {str(e)}"
    
    def check_connection(self) -> bool:
        """
        Check if Ollama server is accessible
        
        Returns:
            True if connected, False otherwise
        """
        try:
            self.client.list()
            return True
        except Exception as e:
            print(f"[OllamaAgent] Connection check failed: {e}")
            return False
    
    def list_models(self) -> list:
        """
        List available models
        
        Returns:
            List of model names
        """
        try:
            models = self.client.list()
            return [model['name'] for model in models.get('models', [])]
        except Exception as e:
            print(f"[OllamaAgent] Error listing models: {e}")
            return []
