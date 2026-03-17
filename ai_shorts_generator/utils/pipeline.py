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

class ShortsPipeline:
    def __init__(self, progress_callback=None):
        self.progress_callback = progress_callback
        self.downloader = Downloader()
        self.transcriber = Transcriber()
        self.detector = HighlightDetector()
        self.editor = VideoEditor()
        self.captioner = CaptionGenerator()
        self.metadata_gen = MetadataGenerator()
        self.hook_gen = HookGenerator()

    def _update_progress(self, step, percentage, message):
        if self.progress_callback:
            self.progress_callback(step, percentage, message)
        print(f"[{percentage}%] {step}: {message}")

    def generate(self, url, short_count=3, max_duration=60, export_path='ai_shorts_generator/export'):
        exporter = Exporter(export_dir=export_path)
        selector = ClipSelector(max_duration=max_duration)

        # 1. Download
        self._update_progress("Downloading", 10, f"Downloading video from {url}...")
        video_path, audio_path, video_info = self.downloader.download(url)

        # 2. Transcription and Signal Analysis (Parallel)
        self._update_progress("Analyzing", 30, "Transcribing and Analyzing Signals...")
        with concurrent.futures.ThreadPoolExecutor() as executor:
            transcription_future = executor.submit(self.transcriber.transcribe, audio_path)
            audio_analysis_future = executor.submit(self.detector.audio_analyzer.analyze_audio, audio_path)
            motion_analysis_future = executor.submit(self.detector.motion_detector.analyze_motion, video_path)

            transcript = transcription_future.result()
            audio_data = audio_analysis_future.result()
            motion_data = motion_analysis_future.result()

        if not os.path.exists("temp"):
            os.makedirs("temp")
        self.transcriber.save_transcript(transcript, "temp/transcript.json")

        # 3. Detect Highlights
        self._update_progress("Highlight Detection", 50, "Detecting viral highlights...")
        highlight_scores = self.detector.get_highlight_scores_with_data(transcript, audio_data, motion_data)

        # 4. Select Clips
        self._update_progress("Clip Selection", 60, "Selecting best clips...")
        selected_clips = selector.select_clips(highlight_scores, count=short_count)

        # 5. Edit and Export
        self._update_progress("Editing", 70, f"Processing {len(selected_clips)} clips...")
        exported_files = []
        for i, clip_info in enumerate(selected_clips):
            step_percentage = 70 + int((i / len(selected_clips)) * 25)
            self._update_progress("Editing", step_percentage, f"Processing Short {i+1}/{len(selected_clips)}")

            hook_text = self.hook_gen.generate_hook(clip_info['text'])
            base_clip = self.editor.process_clip(video_path, clip_info['start'], clip_info['end'], f"short_{i+1}_raw.mp4")
            final_clip = self.captioner.add_captions(base_clip, transcript, clip_info['start'], hook_text=hook_text)

            video_filename = f"short_{i+1}.mp4"
            exported_video = exporter.export_video(final_clip, video_filename)
            exporter.export_thumbnail(final_clip, f"thumbnail_{i+1}.jpg")

            metadata = self.metadata_gen.generate(clip_info['text'], video_info)
            self.metadata_gen.save_metadata(metadata, os.path.join(exporter.export_dir, f"metadata_{i+1}.json"))
            exported_files.append(exported_video)

        self._update_progress("Complete", 100, "Generation finished!")
        return exported_files
