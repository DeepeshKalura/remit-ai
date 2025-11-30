from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from src.models.schemas import ChatRequest
from src.agents.remit_agent import RemitAgentManager

router = APIRouter(tags=["AI Chat"])
agent_manager = RemitAgentManager()

@router.post("/api/chat")
async def chat(request: ChatRequest):
    async def event_stream():
        async for chunk in agent_manager.chat(request.message, request.context):
            yield f"data: {chunk}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")