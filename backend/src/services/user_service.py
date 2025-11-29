from typing import List, Optional
from thefuzz import fuzz, process
from src.models.schemas import User

# Mock Database
MOCK_USERS = [
    {"id": 1, "name": "Dipisha Kalura", "country": "Finland", "wallet": "addr_test1qz8w9...", "currency": "EUR"},
    {"id": 2, "name": "Rahul Sharma", "country": "India", "wallet": "addr_test1qx7y8...", "currency": "INR"},
    {"id": 3, "name": "Alice Smith", "country": "USA", "wallet": "addr_test1qa2b3...", "currency": "USD"},
    {"id": 4, "name": "Maria Garcia", "country": "Mexico", "wallet": "addr_test1qc4d5...", "currency": "MXN"},
    {"id": 5, "name": "John Doe", "country": "Canada", "wallet": "addr_test1qe6f7...", "currency": "CAD"},
]

class UserService:
    def get_all(self) -> List[User]:
        return [User(**u) for u in MOCK_USERS]

    def get_by_id(self, user_id: int) -> Optional[User]:
        user = next((u for u in MOCK_USERS if u["id"] == user_id), None)
        return User(**user) if user else None

    def search_by_name(self, name: str, threshold: int = 60) -> List[User]:
        if not name.strip():
            return []
            
        name_map = {u["name"]: u for u in MOCK_USERS}
        matches = process.extract(name, name_map.keys(), scorer=fuzz.token_sort_ratio)
        
        results = []
        for match_name, score in matches:
            if score >= threshold:
                user_data = name_map[match_name].copy()
                user_data["match_score"] = score
                results.append(User(**user_data))
        
        return results