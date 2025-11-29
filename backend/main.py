"""
RemitAI Python Backend
CrewAI-powered agent for remittance optimization
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.settings import settings

os.environ["HOME"] = "/tmp"
os.environ["XDG_CACHE_HOME"] = "/tmp"

# Import Routers
from src.routers import users, chat
from src.agents import masumi_agent

app = FastAPI(
    title="RemitAI Backend",
    version="2.0.0",
    description="Service-Oriented Architecture with CrewAI"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(users.router)
# app.include_router(rates.router)
app.include_router(chat.router)

# Masumi Protocol
app.include_router(masumi_agent.router)



@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "llm_provider": settings.LLM_PROVIDER,
        "network": settings.CARDANO_NETWORK
    }