# /src/agents/masumi_agent.py

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, Optional
from src.agents.remit_agent import RemitAgentManager
from src.core.settings import settings
from src.services.masumi_service import masumi_service 
from loguru import logger
import uuid

router = APIRouter(prefix="/api/masumi", tags=["Masumi Protocol (MIP-003)"])
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
    # 1. Verify Payment
    if settings.SELLER_VKEY: # SELLER_VKEY being set indicates that payment is required
        if not request.payment_tx_hash:
            raise HTTPException(status_code=402, detail="Payment required: payment_tx_hash is missing.")
        
        is_paid = await masumi_service.verify_payment(request.payment_tx_hash)
        if not is_paid:
            raise HTTPException(status_code=402, detail="Payment not confirmed or invalid. Please ensure the transaction is confirmed on the blockchain.")

    job_id = f"job_{uuid.uuid4()}"
    job_store[job_id] = {"status": "processing", "result": None}

    # Run Agent in Background
    message = request.input.get("message")
    if not message:
        raise HTTPException(status_code=400, detail="Input 'message' is required.")
        
    background_tasks.add_task(run_agent_task, job_id, message, request.input.get("context"))

    return {"job_id": job_id, "status": "processing"}

@router.get("/status/{job_id}")
async def get_job_status(job_id: str):
    """MIP-003: Check job status."""
    job = job_store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

# --- Background Worker ---
async def run_agent_task(job_id: str, message: str, context: Optional[dict]):
    """
    Executes the agent's chat logic and stores the final result.
    This now correctly handles the async generator from the agent.
    """
    try:
        logger.info(f"Starting background task for job_id: {job_id}")
        
        result_chunks = []
        async for chunk in agent_manager.chat(message, context):
            result_chunks.append(chunk)
        
        final_result = "".join(result_chunks)
        
        job_store[job_id] = {"status": "completed", "result": final_result}
        logger.success(f"Completed background task for job_id: {job_id}")
    except Exception as e:
        logger.error(f"Background task for job_id {job_id} failed: {e}")
        job_store[job_id] = {"status": "failed", "error": str(e)}