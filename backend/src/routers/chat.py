from fastapi import APIRouter
from src.models.schemas import ChatRequest
from src.agents.remit_agent import RemitAgentManager
from fastapi.responses import StreamingResponse

router = APIRouter(tags=["AI Chat"])
agent_manager = RemitAgentManager()

@router.post("/api/chat")
async def chat(request: ChatRequest):
    return StreamingResponse(
        agent_manager.chat(request.message, request.context),
        media_type="text/event-stream"
    )