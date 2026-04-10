import yt_dlp
import os

url = "https://www.youtube.com/watch?v=INQw5iRweUI"
opts = {
    'format': 'bestvideo[vcodec^=avc1][ext=mp4]+bestaudio[ext=m4a]/best[vcodec^=avc1][ext=mp4]/best',
    'js_runtimes': ['node'],
    'quiet': True
}

try:
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=False)
        print("Success with list")
except Exception as e:
    print(f"Failed with list: {e}")

opts['js_runtimes'] = {'node': {}}
try:
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=False)
        print("Success with dict")
except Exception as e:
    print(f"Failed with dict: {e}")
