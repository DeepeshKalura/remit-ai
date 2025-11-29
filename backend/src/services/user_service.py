import json
import os
import uuid
import ast
from typing import List, Optional
from datetime import datetime
from src.models.schemas import User, Payee, PayeeCreate
from src.core.llm_factory import LLMFactory
import httpx 

DATA_FILE = "src/data/users.json"

class UserService:
    """
    User operation in our platform
    """
    BASE_URL = "https://agg-api.minswap.org/aggregator/"

    def __init__(self):
        self.llm = LLMFactory.create_llm()
        self._ensure_data_file()

    def _ensure_data_file(self):
        """Ensures the local JSON storage exists and has a default admin user."""
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        if not os.path.exists(DATA_FILE):
            initial_data = [
                {
                    "id": 99, 
                    "name": "Admin User", 
                    "country": "USA", 
                    "wallet": "addr_test1_sender_wallet_12345", 
                    "currency": "USD",
                    "payees": []
                }
            ]
            with open(DATA_FILE, 'w') as f:
                json.dump(initial_data, f, indent=4)

    def _load_users(self) -> List[dict]:
        """Safely loads users from the JSON file."""
        if not os.path.exists(DATA_FILE):
            return []
        try:
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            return []

    def _save_users(self, users: List[dict]):
        """Persists the user list (and their payees) to the JSON file."""
        with open(DATA_FILE, 'w') as f:
            json.dump(users, f, indent=4, default=str)

    def get_all(self) -> List[User]:
        users = self._load_users()
        return [User(**u) for u in users]

    def get_by_id(self, user_id: int) -> Optional[User]:
        users = self._load_users()
        user = next((u for u in users if u["id"] == user_id), None)
        return User(**user) if user else None

    def get_by_wallet(self, wallet_address: str) -> Optional[User]:
        users = self._load_users()
        user = next((u for u in users if u.get("wallet") == wallet_address), None)
        return User(**user) if user else None

    # --- Payee Logic ---

    def generate_tags(self, description: str) -> List[str]:
        """
        AI Helper: Reads a description and returns a list of semantic tags.
        """
        if not description:
            return ["General"]

        prompt = f"""
        You are a data labeling assistant.
        Analyze this payment description: "{description}"
        Extract 3-5 high-level category tags (e.g., Family, Rent, Business, Utilities).
        Return ONLY a Python list of strings. Do not include markdown or explanations.
        Example Output: ["Rent", "Housing", "Priority"]
        """
        
        try:
            response = self.llm.call(messages=[{"role": "user", "content": prompt}])
            
            # Cleanup string to just get the list part
            cleaned_response = response.replace("```python", "").replace("```", "").strip()
            
            # Safe evaluation using ast.literal_eval instead of eval()
            if "[" in cleaned_response and "]" in cleaned_response:
                # Extract just the list part if there's extra text
                start = cleaned_response.find("[")
                end = cleaned_response.rfind("]") + 1
                list_str = cleaned_response[start:end]
                return ast.literal_eval(list_str)
                
            return [cleaned_response]
        except Exception as e:
            print(f"Tag Gen Error: {e}")
            return ["General"]

    def add_payee(self, user_id: int, payee_data: PayeeCreate) -> Payee:
        """
        Creates a new Payee, generates AI tags, and saves to users.json.
        """
        users = self._load_users()
        
        # Find the target user index
        user_idx = next((i for i, u in enumerate(users) if u["id"] == user_id), -1)
        if user_idx == -1:
            raise ValueError("User not found")

        # 1. Generate Tags
        tags = self.generate_tags(payee_data.description)

        # 2. Create Payee Object
        new_payee = {
            "id": str(uuid.uuid4())[:8],
            "name": payee_data.name,
            "wallet_address": payee_data.wallet_address,
            "country": payee_data.country,
            "currency": payee_data.currency,
            "tags": tags,
            "created_at": datetime.now().isoformat()
        }

        # 3. Save to User's list
        if "payees" not in users[user_idx]:
            users[user_idx]["payees"] = []
            
        users[user_idx]["payees"].append(new_payee)
        
        # 4. PERSIST TO DISK
        self._save_users(users)
        
        return Payee(**new_payee)

    def search_payees(self, user_id: int, query: str) -> List[Payee]:
        """
        Search a user's payee list by Name or Tags.
        """
        user = self.get_by_id(user_id)
        if not user or not user.payees:
            return []
        
        query = query.lower().strip()
        results = []
        
        for p in user.payees:
            # Check for match in Name
            name_match = query in p.name.lower()
            
            # Check for match in Tags
            tag_match = any(query in t.lower() for t in p.tags)
            
            if name_match or tag_match:
                results.append(p)
                
        return results

    def get_payees(self, user_id: int) -> List[Payee]:
        """
        Get all payees for a user.
        """
        user = self.get_by_id(user_id)
        if not user or not user.payees:
            return []
        return user.payees


    def search_by_name(self, name: str) -> List[User]:
        """
        Search for Users (Global directory) by name.
        """
        users = self.get_all()
        return [u for u in users if name.lower() in u.name.lower()]

    async def fetch_user_wallet(self, wallet_address: str, amount_in_decimal: bool = True):
        """
        Query wallet balances and token information.
        """
        url = f"{self.BASE_URL}wallet"
        payload = {
            "wallet": wallet_address,
            "amount_in_decimal": amount_in_decimal
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()  # Raise an exception for bad status codes
            return response.json()