import os
import shutil
import concurrent.futures
import librosa
from moviepy import VideoFileClip
from ai_shorts_generator.download.downloader import Downloader
from ai_shorts_generator.transcription.transcriber import Transcriber
from ai_shorts_generator.highlight_detection.detector import HighlightDetector
from ai_shorts_generator.clip_generation.selector import ClipSelector
from ai_shorts_generator.video_editing.editor import VideoEditor
from ai_shorts_generator.captioning.caption_generator import CaptionGenerator
from ai_shorts_generator.export.metadata_gen import MetadataGenerator
from ai_shorts_generator.export.exporter import Exporter
from ai_shorts_generator.hook_generator.hook_gen import HookGenerator
from ai_shorts_generator.video_editing.broll_manager import BRollManager
from ai_shorts_generator.utils.cache import SignalCache

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
        self.broll_manager = BRollManager()
        self.cache = SignalCache()

    def _update_progress(self, step, percentage, message):
        if self.progress_callback:
            self.progress_callback(step, percentage, message)
        print(f"[{percentage}%] {step}: {message}")

    def _detect_beats(self, audio_path):
        try:
            # Use lower sampling rate for beat detection to save time/memory
            y, sr = librosa.load(audio_path, sr=22050)
            tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
            beat_times = librosa.frames_to_time(beat_frames, sr=sr)
            return beat_times.tolist()
        except Exception as e:
            print(f"Beat detection error: {e}")
            return []

    def analyze_signals(self, url, run_beat_detection=False):
        cached_signals = self.cache.get(url)
        if cached_signals:
            if run_beat_detection and not cached_signals.get('beat_data'):
                self._update_progress("Analyzing", 35, "Running deferred beat detection...")
                cached_signals['beat_data'] = self._detect_beats(cached_signals['audio_path'])
                self.cache.set(url, cached_signals)

            self._update_progress("Analyzing", 30, "Using cached analysis...")
            return cached_signals

        self._update_progress("Downloading", 10, f"Downloading video from {url}...")
        video_path, audio_path, video_info = self.downloader.download(url)

        self._update_progress("Analyzing", 30, "Transcribing and Analyzing Signals...")
        with concurrent.futures.ThreadPoolExecutor() as executor:
            transcription_future = executor.submit(self.transcriber.transcribe, audio_path)
            audio_analysis_future = executor.submit(self.detector.audio_analyzer.analyze_audio, audio_path)
            motion_analysis_future = executor.submit(self.detector.motion_detector.analyze_motion, video_path)

            futures = {
                "transcript": transcription_future,
                "audio_data": audio_analysis_future,
                "motion_data": motion_analysis_future
            }

            if run_beat_detection:
                futures["beat_data"] = executor.submit(self._detect_beats, audio_path)

            results = {}
            for name, future in futures.items():
                try:
                    results[name] = future.result()
                except Exception as e:
                    print(f"Error in {name}: {e}")
                    results[name] = [] if name != "transcript" else None

            transcript = results.get("transcript")
            audio_data = results.get("audio_data", [])
            motion_data = results.get("motion_data", [])
            beat_data = results.get("beat_data", [])

        if not os.path.exists("temp"):
            os.makedirs("temp")

        if transcript:
            self.transcriber.save_transcript(transcript, "temp/transcript.json")

        signals = {
            "video_path": video_path,
            "audio_path": audio_path,
            "video_info": video_info,
            "transcript": transcript,
            "audio_data": audio_data,
            "motion_data": motion_data,
            "beat_data": beat_data
        }
        self.cache.set(url, signals)
        return signals

    def generate_previews(self, url, preferred_duration=None):
        try:
            signals = self.analyze_signals(url)
        except Exception as e:
            self._update_progress("Error", 0, f"Signal analysis failed: {str(e)}")
            raise

        if not signals.get('transcript'):
            self._update_progress("Error", 0, "No transcript generated. Video might be silent or in unsupported format.")
            raise ValueError("No transcript generated.")

        self._update_progress("Highlight Detection", 50, "Detecting top viral moments...")
        highlight_scores = self.detector.get_highlight_scores_with_data(
            signals['transcript'], signals['audio_data'], signals['motion_data']
        )

        selector = ClipSelector(max_duration=60)
        top_moments = selector.select_clips(highlight_scores, count=20, preferred_duration=preferred_duration)

        self._update_progress("Preview Generation", 70, "Generating low-res preview clips...")
        preview_dir = 'temp/previews'
        if not os.path.exists(preview_dir):
            os.makedirs(preview_dir)

        def extract_preview(clip_info, idx):
            start, end = clip_info['start'], clip_info['end']
            output_path = f"{preview_dir}/preview_{idx}.mp4"
            with VideoFileClip(signals['video_path']).subclipped(start, end) as video:
                video_small = video.resized(height=480)
                video_small.write_videofile(output_path, codec='libx264', audio_codec='aac', fps=24, logger=None, bitrate="500k")

            return {
                "id": idx,
                "start": start,
                "end": end,
                "score": round(clip_info['score'], 2),
                "text": clip_info['text'],
                "file_path": f"/previews/preview_{idx}.mp4"
            }

        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures = [executor.submit(extract_preview, m, i) for i, m in enumerate(top_moments)]
            preview_clips = [f.result() for f in futures]

        self._update_progress("Complete", 100, "Preview generation finished!")
        return preview_clips, signals

    def generate(self, url, short_count=3, max_duration=60, export_path='ai_shorts_generator/export', selected_clips=None,
                 mood="serious", music_style="auto", ending_style="hard_cut", caption_style="viral", editing_intensity=3):

        exporter = Exporter(export_dir=export_path)
        signals = self.analyze_signals(url, run_beat_detection=True)

        if selected_clips:
            clips_to_process = selected_clips
        else:
            highlight_scores = self.detector.get_highlight_scores_with_data(
                signals['transcript'], signals['audio_data'], signals['motion_data']
            )
            selector = ClipSelector(max_duration=max_duration)
            clips_to_process = selector.select_clips(highlight_scores, count=short_count)

        self._update_progress("Editing", 70, f"Processing {len(clips_to_process)} clips with style: {mood}...")
        exported_files = []
        for i, clip_info in enumerate(clips_to_process):
            step_percentage = 70 + int((i / len(clips_to_process)) * 25)
            self._update_progress("Editing", step_percentage, f"Processing Short {i+1}/{len(clips_to_process)}")

            hook_text = self.hook_gen.generate_hook(clip_info['text'])
            base_clip = self.editor.process_clip(
                signals['video_path'], clip_info['start'], clip_info['end'], f"short_{i+1}_raw.mp4",
                mood=mood, intensity=editing_intensity, ending_style=ending_style,
                beat_data=signals.get('beat_data')
            )
            final_clip = self.captioner.add_captions(
                base_clip, signals['transcript'], clip_info['start'],
                hook_text=hook_text, style=caption_style
            )

            video_filename = f"short_{i+1}.mp4"
            exported_video = exporter.export_video(final_clip, video_filename)
            exporter.export_thumbnail(final_clip, f"thumbnail_{i+1}.jpg")

            metadata = self.metadata_gen.generate(clip_info['text'], signals['video_info'])
            self.metadata_gen.save_metadata(metadata, os.path.join(exporter.export_dir, f"metadata_{i+1}.json"))
            exported_files.append(exported_video)

        self._update_progress("Complete", 100, "Generation finished!")
        return exported_files
