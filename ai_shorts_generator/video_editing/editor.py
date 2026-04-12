from moviepy import VideoFileClip, ColorClip, CompositeVideoClip, TextClip, ImageClip
from moviepy.video.fx import Resize, Crop, CrossFadeOut, MultiplyColor, GammaCorrection
import os
import numpy as np
import cv2
from .smart_cropper import SmartCropper

class VideoEditor:
    def __init__(self, output_dir='temp/editing'):
        self.output_dir = output_dir
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
        self.smart_cropper = SmartCropper()

    def process_clip(self, video_path, start_time, end_time, output_name, mood="serious", intensity=3,
                     ending_style="hard_cut", beat_data=None, aspect_ratio="9:16"):

        # Mapping common ratios
        ratios = {
            "9:16": 9/16,
            "1:1": 1/1,
            "4:5": 4/5,
            "16:9": 16/9
        }
        target_ratio = ratios.get(aspect_ratio, 9/16)

        # Snap to beats if provided
        if beat_data and intensity >= 4:
            closest_start = min(beat_data, key=lambda x: abs(x - start_time))
            if abs(closest_start - start_time) < 0.5:
                start_time = closest_start

            closest_end = min(beat_data, key=lambda x: abs(x - end_time))
            if abs(closest_end - end_time) < 0.5:
                end_time = closest_end

        video = VideoFileClip(video_path).subclipped(start_time, end_time)

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
            # Ensure the frame is resized back to the target size for consistent dimensions
            return cv2.resize(cropped, (int(crop_w * zoom_factor), int(crop_h * zoom_factor)))

        video = video.transform(transform_frame)

        # Ensure all frames have consistent size after transform (target height based on aspect ratio)
        if aspect_ratio == "9:16":
            video = video.resized(height=1920)
        elif aspect_ratio == "1:1":
            video = video.resized(height=1080)
        elif aspect_ratio == "4:5":
            video = video.resized(height=1350)
        elif aspect_ratio == "16:9":
            video = video.resized(height=1080)

        # Apply sentiment-based color grading
        if mood == "funny":
            # Bright and vibrant
            video = video.with_effects([GammaCorrection(1.2), MultiplyColor(1.1)])
        elif mood == "serious":
            # High contrast, slightly desaturated
            video = video.with_effects([GammaCorrection(0.9)])
        elif mood == "motivational":
            # Warm and inspiring
            video = video.with_effects([MultiplyColor([1.1, 1.0, 0.9])])


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

    def add_meme_overlay(self, video_clip, meme_path, start_time, duration=2.0):
        """
        Overlays a meme/GIF on the video at the specified time.
        """
        if not os.path.exists(meme_path):
            return video_clip

        meme = ImageClip(meme_path).with_duration(duration).with_start(start_time)
        meme = meme.resized(width=video_clip.w * 0.4)
        meme = meme.with_position(('center', 'center'))

        return CompositeVideoClip([video_clip, meme])
