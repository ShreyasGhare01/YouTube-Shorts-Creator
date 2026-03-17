from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import yt_dlp

router = APIRouter()

class VideoInfoRequest(BaseModel):
    url: str

@router.post("/get_video_info")
async def get_video_info(request: VideoInfoRequest):
    try:
        ydl_opts = {'quiet': True, 'no_warnings': True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(request.url, download=False)
            return {
                "title": info.get('title'),
                "duration": info.get('duration'),
                "channel": info.get('uploader')
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
