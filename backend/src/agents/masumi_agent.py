from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, Optional
from src.agents.remit_agent import RemitAgentManager
from src.core.settings import settings

router = APIRouter(tags=["Masumi Protocol (MIP-003)"])
agent_manager = RemitAgentManager()

# --- MIP-003 Models ---
class JobRequest(BaseModel):
    input: Dict[str, Any]
    payment_tx_hash: Optional[str] = None # Proof of payment

class JobResponse(BaseModel):
    job_id: str
    status: str

class InputSchema(BaseModel):
    description: str
    input_schema_definition: Dict[str, Any]

# --- Endpoints ---

@router.get("/availability")
async def check_availability():
    """MIP-003: Check if the agent is ready to accept jobs."""
    return {"available": True, "agent_id": settings.AGENT_IDENTIFIER}

@router.get("/input_schema")
async def get_input_schema():
    """MIP-003: Define what this agent accepts."""
    return InputSchema(
        description="Remittance Assistant Agent. Accepts natural language queries about rates and users.",
        input_schema_definition={
            "type": "object",
            "properties": {
                "message": {"type": "string", "description": "The user query (e.g., 'Send 100 ADA to India')"},
                "context": {"type": "object", "description": "Optional user context (wallet, history)"}
            },
            "required": ["message"]
        }
    )

# In-memory job store (Use Redis/DB for production)
job_store = {}

@router.post("/start_job")
async def start_job(request: JobRequest, background_tasks: BackgroundTasks):
    """MIP-003: Start a paid job."""
    # 1. Verify Payment (Simplified for local dev)
    if settings.SELLER_VKEY and not request.payment_tx_hash:
        # In real Masumi, you verify the tx with the Payment Service here
        pass 

    job_id = f"job_{len(job_store) + 1}"
    job_store[job_id] = {"status": "processing", "result": None}

    # Run Agent in Background
    # cleaby    
    background_tasks.add_task(run_agent_task, job_id, request.input.get("message", ""))

    return {"job_id": job_id, "status": "processing"}

@router.get("/status/{job_id}")
async def get_job_status(job_id: str):
    """MIP-003: Check job status."""
    job = job_store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

# --- Background Worker ---
async def run_agent_task(job_id: str, message: str):
    try:
        # Calls the SAME agent logic as your chat API
        result = agent_manager.chat(message)
        job_store[job_id] = {"status": "completed", "result": result}
    except Exception as e:
        job_store[job_id] = {"status": "failed", "error": str(e)}