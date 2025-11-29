from typing import List, Optional
from thefuzz import fuzz, process
from src.models.schemas import User

# Mock Database

MOCK_USERS = [
    {
        "id": 1, 
        "name": "Dipisha Kalura", 
        "country": "Finland", 
        "wallet": "addr_test1qz8w9...", 
        "currency": "EUR",
        "tags": ["Family", "Priority"],
        "relationships": []
    },
    {
        "id": 2, 
        "name": "Rahul Sharma", 
        "country": "India", 
        "wallet": "addr_test1qx7y8...", 
        "currency": "INR",
        "tags": ["Business"],
        "relationships": []
    },
    {
        "id": 99, 
        "name": "Current User", 
        "country": "USA", 
        "wallet": "addr_test1_sender...", 
        "currency": "USD",
        "tags": [],
        "relationships": [
            {"related_user_id": 1, "relation_name": "sister", "type": "family"},
            {"related_user_id": 2, "relation_name": "contractor", "type": "business"}
        ]
    }
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
    
    def get_user_relationships(self, user_id: int) -> List[dict]:
        user = self.get_by_id(user_id)
        if not user: 
            return []
        
        hydrated = []
        for rel in user.relationships:
            related_user = self.get_by_id(rel.related_user_id)
            if related_user:
                hydrated.append({
                    "relation": rel.relation_name, 
                    "name": related_user.name,     
                    "country": related_user.country
                })
        return hydrated