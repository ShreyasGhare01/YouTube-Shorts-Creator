from moviepy import TextClip, CompositeVideoClip
import os

class CaptionGenerator:
    def __init__(self):
        self.font = None

    def add_captions(self, video_clip, transcript, start_offset, hook_text=None):
        clips_to_composite = [video_clip]

        clip_start = start_offset
        clip_end = start_offset + video_clip.duration

        if hook_text:
            try:
                hook_clip = TextClip(
                    text=hook_text,
                    font_size=100,
                    color='yellow',
                    stroke_color='black',
                    stroke_width=4,
                    method='label',
                    duration=2.5
                ).with_start(0).with_position(('center', 'center'))
                clips_to_composite.append(hook_clip)
            except Exception as e:
                print(f"Error creating Hook TextClip: {e}")

        for segment in transcript:
            for word_info in segment.get('words', []):
                word_start = word_info['start']
                word_end = word_info['end']

                if word_start >= clip_start and word_end <= clip_end:
                    start_relative = word_start - clip_start
                    if hook_text and start_relative < 2.5:
                        continue

                    try:
                        txt_clip = TextClip(
                            text=word_info['word'].upper(),
                            font_size=70,
                            color='white',
                            stroke_color='black',
                            stroke_width=2,
                            method='label',
                            duration=word_end - word_start
                        ).with_start(start_relative).with_position(('center', 1400))

                        clips_to_composite.append(txt_clip)
                    except Exception as e:
                        print(f"Error creating TextClip: {e}")

        return CompositeVideoClip(clips_to_composite)
