import os
from moviepy import VideoFileClip, ImageClip

class BRollManager:
    """
    Manages keyword-based stock footage/image insertion points for a video clip.
    """
    def __init__(self, stock_dir='assets/stock_broll'):
        self.stock_dir = stock_dir
        if not os.path.exists(self.stock_dir):
            os.makedirs(self.stock_dir)

    def find_relevant_broll(self, transcript_segment):
        """
        Finds a local stock clip/image that matches a keyword in the transcript.
        """
        words = [w.lower() for w in transcript_segment.split() if len(w) > 4]

        # Simple local search in stock directory
        for word in words:
            potential_file = os.path.join(self.stock_dir, f"{word}.mp4")
            if os.path.exists(potential_file):
                return {"path": potential_file, "type": "video"}

            potential_image = os.path.join(self.stock_dir, f"{word}.jpg")
            if os.path.exists(potential_image):
                return {"path": potential_image, "type": "image"}

        return None

    def insert_broll(self, base_clip, broll_info, start_time, duration=3.0):
        """
        Creates a B-Roll overlay clip.
        """
        if not broll_info:
            return None

        try:
            if broll_info['type'] == 'video':
                broll = VideoFileClip(broll_info['path']).subclipped(0, duration)
            else:
                broll = ImageClip(broll_info['path']).with_duration(duration)

            broll = broll.resized(width=base_clip.w).with_start(start_time).with_position('center')
            return broll
        except Exception as e:
            print(f"Error in B-Roll insertion: {e}")
            return None
