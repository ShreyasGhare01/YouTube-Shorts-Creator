import numpy as np
import re
from .sentiment import SentimentAnalyzer
from .motion import MotionDetector
from .audio_analysis import AudioAnalyzer
from .virality_predictor import ViralityPredictor

class HighlightDetector:
    def __init__(self):
        self.keywords = ["crazy", "watch this", "unbelievable", "look at this", "amazing", "insane", "incredible", "wow"]
        self.sentiment_analyzer = SentimentAnalyzer()
        self.motion_detector = MotionDetector()
        self.audio_analyzer = AudioAnalyzer()
        self.virality_predictor = ViralityPredictor()

    def score_transcript_keywords(self, text):
        text = text.lower()
        score = 0
        for kw in self.keywords:
            if kw in text:
                score += 1.0
        if '!' in text:
            score += 0.5
        return min(1.0, score / 2.0)

    def get_highlight_scores(self, transcript, audio_path, video_path):
        audio_data = self.audio_analyzer.analyze_audio(audio_path)
        motion_data = self.motion_detector.analyze_motion(video_path)
        return self.get_highlight_scores_with_data(transcript, audio_data, motion_data)

    def get_highlight_scores_with_data(self, transcript, audio_data, motion_data):
        scores = []
        for segment in transcript:
            start = segment['start']
            end = segment['end']

            seg_audio = [v for t, v in audio_data if start <= t <= end]
            audio_intensity = np.mean(seg_audio) if seg_audio else 0

            sentiment_score = self.sentiment_analyzer.get_emotional_intensity(segment['text'])
            speech_emotion = sentiment_score

            seg_motion = [v for t, v in motion_data if start <= t <= end]
            visual_motion = np.mean(seg_motion) if seg_motion else 0

            keyword_score = self.score_transcript_keywords(segment['text'])

            scene_change_score = visual_motion / 10.0
            virality_score = self.virality_predictor.predict_virality(segment['text'])

            # Incorporating the new virality score into a balanced weighted formula
            viral_score = (
                0.25 * speech_emotion +
                0.25 * virality_score +
                0.15 * keyword_score +
                0.15 * (visual_motion / 5.0) +
                0.10 * (audio_intensity * 10) +
                0.10 * min(1.0, scene_change_score)
            )

            scores.append({
                "start": start,
                "end": end,
                "score": viral_score,
                "text": segment['text']
            })

        return scores
