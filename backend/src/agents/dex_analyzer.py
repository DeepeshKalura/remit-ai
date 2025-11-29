"""
DEX Analyzer Agent
Analyzes Cardano DEX liquidity and rates using CrewAI
"""

from crewai import Agent
from crewai.tools import tool


class DexAnalyzerAgent:
    def __init__(self):
        self.agent = Agent(
            role="DEX Rate Analyzer",
            goal="Analyze and aggregate Cardano DEX rates for optimal remittance routing",
            backstory="Expert in Cardano DEX protocols including Minswap and SundaeSwap. Specializes in identifying best rates and liquidity.",
        )

    @tool("Aana")
    def analyze_rates(self, pair: str) -> dict:
        """Analyze rates for a trading pair across multiple DEXes"""
        mock_data = {
            "ADA/PHP": {
                "minswap": {"rate": 52.9, "liquidity": 12500000, "volume": 2400000},
                "sundaeswap": {"rate": 52.85, "liquidity": 8200000, "volume": 1800000},
                "best": "minswap",
            },
            "ADA/INR": {
                "minswap": {"rate": 94.23, "liquidity": 4100000, "volume": 856000},
                "sundaeswap": {"rate": 94.18, "liquidity": 2800000, "volume": 623000},
                "best": "minswap",
            },
        }
        return mock_data.get(pair, {})

    @tool("checker")
    def check_slippage(self, pair: str, amount: float) -> dict:
        """Calculate potential slippage for transaction amount"""
        slippage_percent = 0.1 if amount < 1000 else 0.3
        return {
            "amount": amount,
            "pair": pair,
            "slippage_percent": slippage_percent,
            "impact": "low" if slippage_percent < 0.2 else "medium",
        }

    def execute(self, pair: str, amount: float) -> dict:
        """Execute analysis"""
        rates = self.analyze_rates(pair)
        slippage = self.check_slippage(pair, amount)

        return {
            "pair": pair,
            "amount": amount,
            "rates": rates,
            "slippage": slippage,
            "recommendation": f"Use {rates.get('best', 'N/A')} for best rates",
        }
