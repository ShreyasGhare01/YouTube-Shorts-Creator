import os

class ChapterGenerator:
    """
    Generates YouTube-ready chapters and timestamps from video transcript segments.
    """
    def __init__(self, export_dir='ai_shorts_generator/export'):
        self.export_dir = export_dir

    def generate_chapters(self, transcript):
        """
        Creates a list of timestamps and titles.
        """
        chapters = ["00:00 Introduction"]

        # Simple topic shift detection based on long pauses or keyword changes
        for i in range(1, len(transcript)):
            prev_segment = transcript[i-1]
            curr_segment = transcript[i]

            pause_duration = curr_segment['start'] - prev_segment['end']

            # If pause > 2 seconds, consider it a new chapter
            if pause_duration > 2.0:
                time_str = self._format_timestamp(curr_segment['start'])
                # Use first few words of segment as title
                title = " ".join(curr_segment['text'].split()[:5]).capitalize()
                chapters.append(f"{time_str} {title}")

        return chapters

    def _format_timestamp(self, seconds):
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)

        if hours > 0:
            return f"{hours:02d}:{minutes:02d}:{secs:02d}"
        return f"{minutes:02d}:{secs:02d}"

    def save_chapters(self, chapters, filename="chapters.txt"):
        output_path = os.path.join(self.export_dir, filename)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write("\n".join(chapters))
        return output_path
