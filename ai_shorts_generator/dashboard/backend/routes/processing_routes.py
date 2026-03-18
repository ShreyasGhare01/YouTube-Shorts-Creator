from fastapi import APIRouter, WebSocket, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
import asyncio
import json
from ai_shorts_generator.utils.pipeline import ShortsPipeline

router = APIRouter()

class ProcessingRequest(BaseModel):
    url: str
    short_count: int
    export_path: str
    selected_clips: Optional[List[dict]] = None
    mood: Optional[str] = "serious"
    music_style: Optional[str] = "auto"
    ending_style: Optional[str] = "hard_cut"
    caption_style: Optional[str] = "viral"
    editing_intensity: Optional[int] = 3

class PreviewRequest(BaseModel):
    url: str
    preferred_duration: Optional[int] = 30

active_connections = {}

@router.websocket("/ws/progress")
async def websocket_progress(websocket: WebSocket):
    await websocket.accept()
    task_id = websocket.query_params.get("task_id", "default")
    active_connections[task_id] = websocket
    try:
        while True:
            await websocket.receive_text()
    except:
        active_connections.pop(task_id, None)

def get_progress_callback(task_id):
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
    return progress_callback

@router.post("/generate_previews")
async def generate_previews(request: PreviewRequest):
    task_id = request.url
    pipeline = ShortsPipeline(progress_callback=get_progress_callback(task_id))
    clips, signals = await asyncio.to_thread(pipeline.generate_previews, request.url, request.preferred_duration)
    return {"clips": clips}

@router.post("/generate_shorts")
async def generate_shorts(request: ProcessingRequest, background_tasks: BackgroundTasks):
    task_id = request.url

    def run_pipeline():
        pipeline = ShortsPipeline(progress_callback=get_progress_callback(task_id))
        pipeline.generate(
            url=request.url,
            short_count=request.short_count,
            export_path=request.export_path,
            selected_clips=request.selected_clips,
            mood=request.mood,
            music_style=request.music_style,
            ending_style=request.ending_style,
            caption_style=request.caption_style,
            editing_intensity=request.editing_intensity
        )

    background_tasks.add_task(run_pipeline)
    return {"message": "Processing started", "task_id": task_id}
