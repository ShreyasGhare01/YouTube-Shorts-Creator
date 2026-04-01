import librosa
import numpy as np

class AudioAnalyzer:
    def analyze_audio(self, audio_path):
        # Using a lower sampling rate for faster analysis and lower memory usage
        y, sr = librosa.load(audio_path, sr=16000)
        rms = librosa.feature.rms(y=y)[0]
        times = librosa.frames_to_time(range(len(rms)), sr=sr)
        return list(zip(times, rms))

    def get_speech_speed(self, transcript_segment):
        duration = transcript_segment['end'] - transcript_segment['start']
        if duration <= 0:
            return 0
        word_count = len(transcript_segment.get('words', [])) or len(transcript_segment['text'].split())
        return word_count / duration
