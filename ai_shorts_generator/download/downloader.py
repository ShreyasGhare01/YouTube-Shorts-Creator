import os
import yt_dlp

class Downloader:
    def __init__(self, download_dir='temp/download'):
        self.download_dir = download_dir
        if not os.path.exists(self.download_dir):
            os.makedirs(self.download_dir)

    def download(self, url):
        video_opts = {
            'format': 'bestvideo[vcodec^=avc1][ext=mp4]+bestaudio[ext=m4a]/best[vcodec^=avc1][ext=mp4]/best',
            'outtmpl': os.path.join(self.download_dir, 'video.%(ext)s'),
            'merge_output_format': 'mp4',
            'js_runtimes': ['node'], # Explicitly use node for JS extraction
        }

        audio_opts = {
            'format': 'bestaudio/best',
            'outtmpl': os.path.join(self.download_dir, 'audio.%(ext)s'),
            'js_runtimes': ['node'],
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'wav',
            }],
        }

        # Use static-ffmpeg path if possible
        try:
            from static_ffmpeg import run
            ffmpeg_path, ffprobe_path = run.get_or_fetch_platform_executables_else_raise()
            video_opts['ffmpeg_location'] = ffmpeg_path
            audio_opts['ffmpeg_location'] = ffmpeg_path
        except (ImportError, AttributeError):
            pass

        with yt_dlp.YoutubeDL(video_opts) as ydl:
            video_info = ydl.extract_info(url, download=True)
            video_path = ydl.prepare_filename(video_info)
            # Handle case where merge_output_format changed the extension
            if not os.path.exists(video_path) and os.path.exists(video_path.rsplit('.', 1)[0] + '.mp4'):
                video_path = video_path.rsplit('.', 1)[0] + '.mp4'

        with yt_dlp.YoutubeDL(audio_opts) as ydl:
            audio_info = ydl.extract_info(url, download=True)
            audio_path = ydl.prepare_filename(audio_info).rsplit('.', 1)[0] + '.wav'

        return video_path, audio_path, video_info
