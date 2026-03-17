from moviepy import VideoFileClip, ColorClip, CompositeVideoClip, TextClip
from moviepy.video.fx import Resize, Crop
import os
import numpy as np
from .smart_cropper import SmartCropper

class VideoEditor:
    def __init__(self, output_dir='temp/editing'):
        self.output_dir = output_dir
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
        self.smart_cropper = SmartCropper()

    def process_clip(self, video_path, start_time, end_time, output_name):
        video = VideoFileClip(video_path).subclipped(start_time, end_time)

        target_ratio = 9/16
        w, h = video.size

        smoothed_centers = self.smart_cropper.process_video_crops(video)

        def crop_frame(get_frame, t):
            frame = get_frame(t)
            cx, cy = self.smart_cropper.get_smoothed_center_at_time(t, smoothed_centers, video.duration)

            if w/h > target_ratio:
                crop_w = h * target_ratio
                crop_h = h
            else:
                crop_w = w
                crop_h = w / target_ratio

            x1 = max(0, min(w - crop_w, cx - crop_w / 2))
            y1 = max(0, min(h - crop_h, cy - crop_h / 2))
            x2 = x1 + crop_w
            y2 = y1 + crop_h

            return frame[int(y1):int(y2), int(x1):int(x2)]

        video = video.transform(crop_frame)
        video = video.resized(height=1920) if video.h != 1920 else video

        return video

    def add_background_music(self, video_clip, music_path, volume=0.1):
        pass
