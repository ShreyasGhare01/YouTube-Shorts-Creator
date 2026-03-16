import os

class Exporter:
    def __init__(self, export_dir='ai_shorts_generator/export'):
        self.export_dir = export_dir
        if not os.path.exists(self.export_dir):
            os.makedirs(self.export_dir)

    def export_video(self, video_clip, filename):
        output_path = os.path.join(self.export_dir, filename)
        # Using libx264 as it's standard for web
        video_clip.write_videofile(output_path, codec='libx264', audio_codec='aac', fps=24)
        return output_path

    def export_thumbnail(self, video_clip, filename):
        output_path = os.path.join(self.export_dir, filename)
        # Save a frame from the middle of the clip
        # If it's a composite clip with transparency, convert to RGB first to avoid JPEG error
        frame = video_clip.get_frame(video_clip.duration / 2)
        from PIL import Image
        img = Image.fromarray(frame)
        if img.mode == 'RGBA':
            img = img.convert('RGB')
        img.save(output_path)
        return output_path
