from transformers import pipeline

class SentimentAnalyzer:
    def __init__(self):
        self.sentiment_pipeline = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")

    def analyze(self, text):
        results = self.sentiment_pipeline(text)
        score = 0
        for result in results:
            if result['label'] == 'POSITIVE':
                score += result['score']
            else:
                score -= result['score']
        return score

    def get_emotional_intensity(self, text):
        results = self.sentiment_pipeline(text)
        return max(result['score'] for result in results)
