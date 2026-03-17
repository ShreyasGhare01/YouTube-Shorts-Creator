from fastapi import FastAPI, WebSocket, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from .routes import video_routes, processing_routes

app = FastAPI(title="AI Shorts Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(video_routes.router)
app.include_router(processing_routes.router)

@app.get("/")
async def root():
    return {"message": "AI Shorts Generator API is running"}
