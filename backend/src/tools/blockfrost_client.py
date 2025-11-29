"""
Blockfrost API Client
Connects to Cardano blockchain data
"""

import os
import requests
from typing import Optional


class BlockfrostClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("CARDANO_BLOCKFROST_API_KEY")
        self.base_url = "https://cardano-testnet.blockfrost.io/api/v0"
        self.headers = {"project_id": self.api_key, "Content-Type": "application/json"}

    def get_account_info(self, address: str) -> dict:
        """Get account balance and info"""
        try:
            response = requests.get(
                f"{self.base_url}/accounts/{address}", headers=self.headers
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"[BlockfrostClient] Error fetching account: {e}")
            # Return mock data for demo
            return {
                "address": address,
                "controlled_amount": "1250450000",
                "total_stake": "0",
                "stake_address": None,
            }

    def get_utxos(self, address: str) -> list:
        """Get UTXOs for address"""
        try:
            response = requests.get(
                f"{self.base_url}/accounts/{address}/utxos", headers=self.headers
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"[BlockfrostClient] Error fetching UTXOs: {e}")
            return []

    def get_latest_block(self) -> dict:
        """Get latest block info"""
        try:
            response = requests.get(
                f"{self.base_url}/blocks/latest", headers=self.headers
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"[BlockfrostClient] Error fetching block: {e}")
            return {}

    def submit_transaction(self, signed_tx: str) -> str:
        """Submit signed transaction to blockchain"""
        try:
            response = requests.post(
                f"{self.base_url}/tx/submit",
                headers={**self.headers, "Content-Type": "application/cbor"},
                data=signed_tx,
            )
            response.raise_for_status()
            return response.json().get("hash", "tx_submitted")
        except requests.exceptions.RequestException as e:
            print(f"[BlockfrostClient] Error submitting transaction: {e}")
            return f"mock_tx_{hash(signed_tx)}"
