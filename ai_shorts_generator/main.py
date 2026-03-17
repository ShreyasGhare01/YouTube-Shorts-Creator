import argparse
import os
from ai_shorts_generator.utils.pipeline import ShortsPipeline

def setup_ffmpeg():
    try:
        from static_ffmpeg import run
        ffmpeg_path, ffprobe_path = run.get_or_fetch_platform_executables_else_raise()
        os.environ['IMAGEIO_FFMPEG_EXE'] = ffmpeg_path
        ffmpeg_dir = os.path.dirname(ffmpeg_path)
        if ffmpeg_dir not in os.environ['PATH']:
            os.environ['PATH'] = ffmpeg_dir + os.pathsep + os.environ['PATH']
    except Exception as e:
        print(f"Warning: Could not setup static-ffmpeg: {e}")

def main():
    setup_ffmpeg()
    parser = argparse.ArgumentParser(description="AI YouTube Shorts Generator (Improved)")
    parser.add_argument("--url", required=True, help="YouTube video URL")
    parser.add_argument("--count", type=int, default=3, help="Number of shorts to generate")
    parser.add_argument("--max_duration", type=int, default=60, help="Max duration of each short in seconds")

    args = parser.parse_args()

    pipeline = ShortsPipeline()
    pipeline.generate(args.url, short_count=args.count, max_duration=args.max_duration)

if __name__ == "__main__":
    main()
