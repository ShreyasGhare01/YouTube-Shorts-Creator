from transformers import pipeline
import torch

class ViralityPredictor:
    def __init__(self):
        # Using a model pre-trained for sentiment/sequence classification as a proxy for engagement
        # In a production scenario, this would be a model specifically fine-tuned on viral vs. non-viral data
        model_name = "distilbert-base-uncased-finetuned-sst-2-english"
        self.classifier = pipeline("sentiment-analysis", model=model_name)

    def predict_virality(self, text):
        """
        Predicts a virality score [0, 1] based on semantic engagement and sentiment.
        """
        if not text.strip():
            return 0.0

        try:
            # Truncate text to model's max length if necessary
            result = self.classifier(text[:512])[0]

            # POSITIVE sentiment in this model often correlates with higher engagement
            # Score is based on confidence and label
            score = result['score']
            if result['label'] == 'NEGATIVE':
                # Negative high-intensity emotion can still be viral, so we don't zero it
                score = score * 0.7

            # Boost score for hooks/curiosity markers
            hooks = ["?", "why", "how", "secret", "never", "always", "shocking", "insane"]
            if any(h in text.lower() for h in hooks):
                score = min(1.0, score * 1.2)

            return score
        except Exception as e:
            print(f"Virality prediction error: {e}")
            return 0.5
