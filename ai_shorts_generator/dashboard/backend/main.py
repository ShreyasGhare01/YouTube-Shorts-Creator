from fastapi import FastAPI, WebSocket, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .routes import video_routes, processing_routes
import os

app = FastAPI(title="AI Shorts Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure temp/previews exists for static serving
os.makedirs("temp/previews", exist_ok=True)
app.mount("/previews", StaticFiles(directory="temp/previews"), name="previews")

@app.get("/api/health")
async def health():
    return {"status": "ok"}

app.include_router(video_routes.router, prefix="/api")
app.include_router(processing_routes.router, prefix="/api")

# Serve frontend at the end to avoid intercepting API routes
current_dir = os.path.dirname(os.path.abspath(__file__))
frontend_dist = os.path.normpath(os.path.join(current_dir, "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
