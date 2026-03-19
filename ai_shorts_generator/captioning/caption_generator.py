from moviepy import TextClip, CompositeVideoClip
import os

class CaptionGenerator:
    def __init__(self):
        self.font = None

    def add_captions(self, video_clip, transcript, start_offset, hook_text=None, style="viral"):
        clips_to_composite = [video_clip]

        clip_start = start_offset
        clip_end = start_offset + video_clip.duration

        # Add Hook if provided (0.0 -> 2.5 seconds)
        if hook_text:
            try:
                hook_clip = TextClip(
                    text=hook_text,
                    font_size=100 if style == "viral" else 70,
                    color='yellow' if style == "viral" else 'white',
                    stroke_color='black',
                    stroke_width=4 if style == "viral" else 2,
                    method='label',
                    duration=2.5
                ).with_start(0).with_position(('center', 'center'))
                clips_to_composite.append(hook_clip)
            except Exception as e:
                print(f"Error creating Hook TextClip: {e}")

        # Regular captions
        for segment in transcript:
            for word_info in segment.get('words', []):
                word_start = word_info['start']
                word_end = word_info['end']

                if word_start >= clip_start and word_end <= clip_end:
                    start_relative = word_start - clip_start
                    if hook_text and start_relative < 2.5:
                        continue

                    try:
                        # Styling based on choice and keywords
                        font_size = 70 if style == "viral" else 40
                        color = 'white'
                        word_text = word_info['word']

                        # AI color shifting based on keyword emotion
                        if style == "viral":
                            word_lower = word_text.lower()
                            if any(k in word_lower for k in ["crazy", "wow", "insane", "unbelievable", "shocking"]):
                                color = 'yellow'
                            elif any(k in word_lower for k in ["bad", "wrong", "error", "horrible"]):
                                color = 'red'
                            elif any(k in word_lower for k in ["good", "great", "success", "winner"]):
                                color = 'green'

                        txt_clip = TextClip(
                            text=word_text.upper() if style != "clean" else word_text,
                            font_size=font_size,
                            color=color,
                            stroke_color='black' if style != "clean" else None,
                            stroke_width=2 if style != "clean" else 0,
                            method='label',
                            duration=word_end - word_start
                        ).with_start(start_relative).with_position(('center', 1400 if style != "clean" else 1700))

                        # Basic "pop" animation for viral style
                        if style == "viral":
                            # Dynamic zoom effect (1.0 to 1.1)
                            def zoom_effect(get_frame, t):
                                frame = get_frame(t)
                                zoom = 1.0 + 0.1 * (1 - (t/(word_end-word_start)))
                                h, w = frame.shape[:2]
                                new_h, new_w = int(h * zoom), int(w * zoom)
                                import cv2
                                resized = cv2.resize(frame, (new_w, new_h))
                                # Crop to original size
                                start_h = (new_h - h) // 2
                                start_w = (new_w - w) // 2
                                return resized[start_h:start_h+h, start_w:start_w+w]

                            txt_clip = txt_clip.transform(zoom_effect)

                        clips_to_composite.append(txt_clip)
                    except Exception as e:
                        print(f"Error creating TextClip: {e}")

        return CompositeVideoClip(clips_to_composite)
