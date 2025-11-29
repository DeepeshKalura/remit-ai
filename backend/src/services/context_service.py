from typing import List, Dict, Any
from datetime import datetime, timezone

class ContextService:
    """
    Stores conversation history and user context in memory.
    In production, this would connect to Redis or Postgres.
    """
    def __init__(self):
        self._history: Dict[str, List[Dict[str, str]]] = {}

    def add_message(self, conversation_id: str, role: str, content: str):
        if conversation_id not in self._history:
            self._history[conversation_id] = []
        
        self._history[conversation_id].append({
            "role": role,
            "content": content,
            "timestamp": datetime.now(tz=timezone.utc)

        })

    def get_history(self, conversation_id: str, limit: int = 5) -> str:
        """Returns the last N messages formatted as a string for the LLM"""
        if conversation_id not in self._history:
            return ""
        
        # Get last N messages
        messages = self._history[conversation_id][-limit:]
        
        formatted_history = "PREVIOUS CHAT HISTORY:\n"
        for msg in messages:
            formatted_history += f"{msg['role'].upper()}: {msg['content']}\n"
        
        return formatted_history

    def clear_history(self, conversation_id: str):
        if conversation_id in self._history:
            del self._history[conversation_id]