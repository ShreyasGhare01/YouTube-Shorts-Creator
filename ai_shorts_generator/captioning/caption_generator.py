from moviepy import TextClip, CompositeVideoClip
import os

class CaptionGenerator:
    def __init__(self):
        # We might need to specify a font that exists on the system
        self.font = None # Default

    def add_captions(self, video_clip, transcript, start_offset):
        clips_to_composite = [video_clip]

        # Filter transcript for segments within this clip's time range
        clip_start = start_offset
        clip_end = start_offset + video_clip.duration

        for segment in transcript:
            for word_info in segment.get('words', []):
                word_start = word_info['start']
                word_end = word_info['end']

                if word_start >= clip_start and word_end <= clip_end:
                    # Create TextClip for each word
                    try:
                        txt_clip = TextClip(
                            text=word_info['word'].upper(),
                            font_size=70,
                            color='yellow',
                            stroke_color='black',
                            stroke_width=2,
                            method='label',
                            duration=word_end - word_start
                        ).with_start(word_start - clip_start).with_position(('center', 1400))

                        clips_to_composite.append(txt_clip)
                    except Exception as e:
                        print(f"Error creating TextClip: {e}")
                        # Fallback or skip

        return CompositeVideoClip(clips_to_composite)
