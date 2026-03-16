import json
import os
from faster_whisper import WhisperModel

class Transcriber:
    def __init__(self, model_size="base", device="cpu", compute_type="int8"):
        self.model = WhisperModel(model_size, device=device, compute_type=compute_type)

    def transcribe(self, audio_path):
        segments, info = self.model.transcribe(audio_path, beam_size=5, word_timestamps=True)

        transcript = []
        for segment in segments:
            words = []
            if segment.words:
                for word in segment.words:
                    words.append({
                        "start": word.start,
                        "end": word.end,
                        "word": word.word.strip(),
                        "probability": word.probability
                    })

            transcript.append({
                "start": segment.start,
                "end": segment.end,
                "text": segment.text.strip(),
                "words": words
            })

        return transcript

    def save_transcript(self, transcript, output_path):
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(transcript, f, indent=4, ensure_ascii=False)
