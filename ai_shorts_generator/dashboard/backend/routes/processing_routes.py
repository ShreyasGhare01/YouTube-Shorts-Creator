from fastapi import APIRouter, WebSocket, BackgroundTasks
from pydantic import BaseModel
import asyncio
import json
from ai_shorts_generator.utils.pipeline import ShortsPipeline

router = APIRouter()

class ProcessingRequest(BaseModel):
    url: str
    short_count: int
    export_path: str

# In-memory storage for active websockets by URL or task ID
active_connections = {}

@router.websocket("/ws/progress")
async def websocket_progress(websocket: WebSocket):
    await websocket.accept()
    # Identification might be needed, for MVP we can broadcast or use a simple task ID
    task_id = websocket.query_params.get("task_id", "default")
    active_connections[task_id] = websocket
    try:
        while True:
            await websocket.receive_text()
    except:
        active_connections.pop(task_id, None)

@router.post("/generate_shorts")
async def generate_shorts(request: ProcessingRequest, background_tasks: BackgroundTasks):
    task_id = request.url # Using URL as task ID for simplicity in MVP

    def run_pipeline():
        def progress_callback(step, percentage, message):
            if task_id in active_connections:
                ws = active_connections[task_id]
                asyncio.run_coroutine_threadsafe(
                    ws.send_text(json.dumps({
                        "step": step,
                        "percentage": percentage,
                        "message": message
                    })),
                    asyncio.get_event_loop()
                )

        pipeline = ShortsPipeline(progress_callback=progress_callback)
        pipeline.generate(
            url=request.url,
            short_count=request.short_count,
            export_path=request.export_path
        )

    background_tasks.add_task(run_pipeline)
    return {"message": "Processing started", "task_id": task_id}
