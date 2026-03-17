import argparse
import os
import shutil
import concurrent.futures
from ai_shorts_generator.download.downloader import Downloader
from ai_shorts_generator.transcription.transcriber import Transcriber
from ai_shorts_generator.highlight_detection.detector import HighlightDetector
from ai_shorts_generator.clip_generation.selector import ClipSelector
from ai_shorts_generator.video_editing.editor import VideoEditor
from ai_shorts_generator.captioning.caption_generator import CaptionGenerator
from ai_shorts_generator.export.metadata_gen import MetadataGenerator
from ai_shorts_generator.export.exporter import Exporter
from ai_shorts_generator.hook_generator.hook_gen import HookGenerator

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

    downloader = Downloader()
    transcriber = Transcriber()
    detector = HighlightDetector()
    selector = ClipSelector(max_duration=args.max_duration)
    editor = VideoEditor()
    captioner = CaptionGenerator()
    metadata_gen = MetadataGenerator()
    exporter = Exporter()
    hook_gen = HookGenerator()

    print(f"--- Starting Improved Pipeline for: {args.url} ---")

    print("Step 1: Downloading video and audio...")
    video_path, audio_path, video_info = downloader.download(args.url)

    print("Step 2 & 3: Transcribing and Analyzing Signals in Parallel...")
    with concurrent.futures.ThreadPoolExecutor() as executor:
        # Run independent analysis tasks concurrently
        transcription_future = executor.submit(transcriber.transcribe, audio_path)
        audio_analysis_future = executor.submit(detector.audio_analyzer.analyze_audio, audio_path)
        motion_analysis_future = executor.submit(detector.motion_detector.analyze_motion, video_path)

        # Wait for all to complete
        transcript = transcription_future.result()
        audio_data = audio_analysis_future.result()
        motion_data = motion_analysis_future.result()

    if not os.path.exists("temp"):
        os.makedirs("temp")
    transcriber.save_transcript(transcript, "temp/transcript.json")

    print("Step 4: Detecting viral highlights...")
    # Inject pre-calculated data into detector for this run
    highlight_scores = detector.get_highlight_scores_with_data(transcript, audio_data, motion_data)

    print("Step 5: Selecting best clips...")
    selected_clips = selector.select_clips(highlight_scores, count=args.count)

    print(f"Step 6: Processing {len(selected_clips)} clips with hooks and smart crop...")
    for i, clip_info in enumerate(selected_clips):
        print(f"  Processing Short {i+1}/{len(selected_clips)} (Start: {clip_info['start']:.2f}s, End: {clip_info['end']:.2f}s)")

        hook_text = hook_gen.generate_hook(clip_info['text'])
        print(f"    Generated Hook: {hook_text}")

        base_clip = editor.process_clip(video_path, clip_info['start'], clip_info['end'], f"short_{i+1}_raw.mp4")

        final_clip = captioner.add_captions(base_clip, transcript, clip_info['start'], hook_text=hook_text)

        video_filename = f"short_{i+1}.mp4"
        exporter.export_video(final_clip, video_filename)

        exporter.export_thumbnail(final_clip, f"thumbnail_{i+1}.jpg")

        metadata = metadata_gen.generate(clip_info['text'], video_info)
        metadata_gen.save_metadata(metadata, os.path.join(exporter.export_dir, f"metadata_{i+1}.json"))

    print(f"--- Improved Pipeline Finished! Exports available in: {exporter.export_dir} ---")

if __name__ == "__main__":
    main()
