from fastapi import APIRouter
from src.models.schemas import ChatRequest
from src.agents.remit_agent import RemitAgentManager

router = APIRouter(prefix="/api/chat", tags=["AI Chat"])
agent_manager = RemitAgentManager()

@router.post("")
async def chat(request: ChatRequest):
    response = agent_manager.chat(request.message, request.context)
    return {"response": response}