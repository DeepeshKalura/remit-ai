"""
User Management and Search Tool
Provides fuzzy search functionality for finding users by name
"""

from typing import Optional, List, Dict
from thefuzz import fuzz, process


MOCK_USERS = [
    {"id": 1, "name": "Dipisha Kalura", "country": "Finland", "wallet": "addr_test1qz8w9...", "currency": "EUR"},
    {"id": 2, "name": "Rahul Sharma", "country": "India", "wallet": "addr_test1qx7y8...", "currency": "INR"},
    {"id": 3, "name": "Alice Smith", "country": "USA", "wallet": "addr_test1qa2b3...", "currency": "USD"},
    {"id": 4, "name": "Maria Garcia", "country": "Mexico", "wallet": "addr_test1qc4d5...", "currency": "MXN"},
    {"id": 5, "name": "John Doe", "country": "Canada", "wallet": "addr_test1qe6f7...", "currency": "CAD"},
]


class Users:
    """User management with fuzzy search capabilities"""
    
    def __init__(self):
        self.users = MOCK_USERS
    
    def search_user(self, name: str, threshold: int = 60) -> List[Dict]:
        """
        Search users by name using fuzzy matching
        
        Args:
            name: Name or partial name to search for
            threshold: Minimum similarity score (0-100), default 60
        
        Returns:
            List of matching users sorted by similarity score
        """
        if not name or not name.strip():
            return []
        
        # Create a dictionary mapping names to user objects
        name_to_user = {user["name"]: user for user in self.users}
        
        # Use process.extract to get matches with scores
        matches = process.extract(
            name,
            name_to_user.keys(),
            scorer=fuzz.token_sort_ratio,
            limit=len(self.users)
        )
        
        # Filter by threshold and return user objects with scores
        results = []
        for match_name, score in matches:
            if score >= threshold:
                user = name_to_user[match_name].copy()
                user["match_score"] = score
                results.append(user)

        
        return results
    
    def get_user_by_id(self, user_id: int) -> Optional[Dict]:
        """
        Get user by ID
        
        Args:
            user_id: User ID to search for
        
        Returns:
            User dict if found, None otherwise
        """
        for user in self.users:
           if user["id"] == user_id:
                return user.copy()
        return None
    
    def get_all_users(self) -> List[Dict]:
        """
        Get all users
        
        Returns:
            List of all users
        """
        return [user.copy() for user in self.users]
    
    def add_user(self, name: str, country: str, wallet: str, currency: str) -> Dict:
        """
        Add a new user (for demo purposes)
        
        Args:
            name: User's full name
            country: User's country
            wallet: Cardano wallet address
            currency: User's currency
        
        Returns:
            The newly created user
        """
        new_id = max(user["id"] for user in self.users) + 1
        new_user = {
            "id": new_id,
            "name": name,
            "country": country,
            "wallet": wallet,
            "currency": currency
        }
        self.users.append(new_user)
        return new_user.copy()

