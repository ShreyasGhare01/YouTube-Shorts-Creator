import numpy as np
from pydub import AudioSegment
import re

class HighlightDetector:
    def __init__(self):
        self.keywords = ["crazy", "watch this", "unbelievable", "look at this", "amazing", "insane", "incredible", "wow"]

    def analyze_audio_energy(self, audio_path, chunk_ms=1000):
        audio = AudioSegment.from_file(audio_path)
        energies = []
        for i in range(0, len(audio), chunk_ms):
            chunk = audio[i:i+chunk_ms]
            energies.append(chunk.rms)
        return np.array(energies)

    def score_transcript(self, transcript):
        scores = []
        for segment in transcript:
            text = segment['text'].lower()
            score = 0
            for kw in self.keywords:
                if kw in text:
                    score += 10

            # Simple excitement detection based on punctuation
            if '!' in segment['text']:
                score += 5

            # Emotion/Sentiment would go here, but for now we use keywords
            scores.append(score)
        return np.array(scores)

    def get_highlight_scores(self, transcript, audio_energies):
        # Normalize energies
        if len(audio_energies) > 0:
            max_energy = np.max(audio_energies) if np.max(audio_energies) > 0 else 1
            norm_energies = audio_energies / max_energy
        else:
            norm_energies = np.array([])

        scores = []
        for i, segment in enumerate(transcript):
            start_idx = int(segment['start'])
            end_idx = int(segment['end'])

            # Average energy during this segment
            seg_energy = np.mean(norm_energies[start_idx:end_idx+1]) if end_idx < len(norm_energies) else 0

            t_score = self.score_transcript([segment])[0]

            # Combined score
            combined_score = 0.4 * t_score + 0.6 * seg_energy * 20

            scores.append({
                "start": segment['start'],
                "end": segment['end'],
                "score": combined_score,
                "text": segment['text']
            })

        return scores
