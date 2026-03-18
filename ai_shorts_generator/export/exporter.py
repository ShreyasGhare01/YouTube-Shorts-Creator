import os
from moviepy import VideoFileClip

class Exporter:
    def __init__(self, export_dir='ai_shorts_generator/export'):
        self.export_dir = export_dir
        if not os.path.exists(self.export_dir):
            os.makedirs(self.export_dir)

    def export_video(self, clip, filename, codec='libx264', audio_codec='aac', fps=30, bitrate=None):
        """
        Exports the final video clip to the specified directory.
        """
        output_path = os.path.join(self.export_dir, filename)

        # Check for hardware acceleration availability (NVENC)
        # In a real environment, we'd check if nvidia-smi exists or try a test encode.
        # For this implementation, we'll allow overriding the codec.

        write_kwargs = {
            "codec": codec,
            "audio_codec": audio_codec,
            "fps": fps,
            "temp_audiofile": f'temp-audio-{filename}.m4a',
            "remove_temp": True,
            "logger": None
        }

        if bitrate:
            write_kwargs["bitrate"] = bitrate

        clip.write_videofile(output_path, **write_kwargs)
        return output_path

    def export_thumbnail(self, clip, filename, t=1.0):
        """
        Exports a thumbnail from the clip at time t.
        """
        output_path = os.path.join(self.export_dir, filename)
        clip.save_frame(output_path, t=t)
        return output_path
