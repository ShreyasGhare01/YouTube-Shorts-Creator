from moviepy import VideoFileClip, ColorClip, CompositeVideoClip, TextClip
from moviepy.video.fx import Resize, Crop, CrossFadeOut
import os
import numpy as np
from .smart_cropper import SmartCropper

class VideoEditor:
    def __init__(self, output_dir='temp/editing'):
        self.output_dir = output_dir
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
        self.smart_cropper = SmartCropper()

    def process_clip(self, video_path, start_time, end_time, output_name, mood="serious", intensity=3, ending_style="hard_cut"):
        video = VideoFileClip(video_path).subclipped(start_time, end_time)

        target_ratio = 9/16
        w, h = video.size

        smoothed_centers = self.smart_cropper.process_video_crops(video)

        def transform_frame(get_frame, t):
            frame = get_frame(t)
            cx, cy = self.smart_cropper.get_smoothed_center_at_time(t, smoothed_centers, video.duration)

            # Apply dynamic zoom based on intensity and mood
            zoom_factor = 1.0
            if intensity >= 4 or mood in ["high_energy", "funny"]:
                # Periodic zoom effect
                zoom_factor = 1.0 + 0.1 * np.sin(t * np.pi)

            if w/h > target_ratio:
                crop_w = (h * target_ratio) / zoom_factor
                crop_h = h / zoom_factor
            else:
                crop_w = w / zoom_factor
                crop_h = (w / target_ratio) / zoom_factor

            x1 = max(0, min(w - crop_w, cx - crop_w / 2))
            y1 = max(0, min(h - crop_h, cy - crop_h / 2))
            x2 = x1 + crop_w
            y2 = y1 + crop_h

            cropped = frame[int(y1):int(y2), int(x1):int(x2)]
            return cropped

        video = video.transform(transform_frame)
        video = video.resized(height=1920) if video.h != 1920 else video

        # Apply Ending Style
        if ending_style == "fade_out":
            video = video.with_effects([CrossFadeOut(1.5)])
        elif ending_style == "zoom_fade":
            # Simplified zoom fade logic
            video = video.with_effects([CrossFadeOut(1.0)])

        return video

    def add_background_music(self, video_clip, music_path, volume=0.1):
        from moviepy import AudioFileClip, CompositeAudioClip

        if not os.path.exists(music_path):
            return video_clip

        bg_music = AudioFileClip(music_path).with_volume_scaled(volume)

        # Loop music if shorter than video
        if bg_music.duration < video_clip.duration:
            bg_music = bg_music.with_effects([lambda clip: clip.with_duration(video_clip.duration).with_audio_loop()])
        else:
            bg_music = bg_music.subclipped(0, video_clip.duration)

        # Composite with original audio
        new_audio = CompositeAudioClip([video_clip.audio, bg_music])
        return video_clip.with_audio(new_audio)
