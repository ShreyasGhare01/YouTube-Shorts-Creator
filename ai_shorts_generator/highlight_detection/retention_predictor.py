import numpy as np

class RetentionPredictor:
    """
    Predicts audience retention drops based on statistical metrics like
    WPM, visual motion intensity, and sentiment variance.
    """
    def predict_retention_heatmap(self, transcript, motion_data, audio_data):
        heatmap = []

        for segment in transcript:
            start = segment['start']
            end = segment['end']
            duration = end - start

            # Words per minute (WPM) - high WPM often helps retention
            wpm = (len(segment['text'].split()) / duration) * 60 if duration > 0 else 0

            # Visual motion intensity
            seg_motion = [v for t, v in motion_data if start <= t <= end]
            motion_intensity = np.mean(seg_motion) if seg_motion else 0

            # Retention score calculation (Simplified statistical model)
            retention_score = (
                0.4 * min(1.0, wpm / 150) +
                0.4 * min(1.0, motion_intensity / 5.0) +
                0.2 * 1.0 # Baseline
            )

            heatmap.append({
                "start": start,
                "end": end,
                "score": round(retention_score, 2)
            })

        return heatmap
