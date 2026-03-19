from transformers import pipeline

class HookGenerator:
    def __init__(self):
        self.generator = pipeline("text-generation", model="distilgpt2")

    def generate_hook(self, transcript_text, style="curiosity"):
        """
        Generates a viral hook in various styles (curiosity, controversy, fear-of-missing-out).
        """
        styles = {
            "curiosity": "Make it extremely mysterious. Use phrases like 'The secret to...' or 'You won't believe...'",
            "controversy": "Make it bold and slightly controversial. Challenge a common belief.",
            "value": "Highlight a shocking fact or a massive value proposition.",
            "emotional": "Focus on the extreme human emotion in the transcript."
        }

        style_instruction = styles.get(style, styles["curiosity"])

        prompt = f"""Given the following transcript from a video clip,
generate a viral 1-sentence hook.

Style: {style_instruction}
Rules:
- 5 to 12 words
- High retention impact
- NO generic introductions

Transcript:
{transcript_text}

Viral Hook:"""

        try:
            # Generate multiple sequences and pick the best one
            responses = self.generator(prompt, max_new_tokens=25, num_return_sequences=2, truncation=True)
            hooks = [r['generated_text'].split("Viral Hook:")[-1].strip().split('\n')[0] for r in responses]

            # Simple heuristic for picking the better hook (curiosity indicators)
            hook = sorted(hooks, key=lambda x: len(x), reverse=True)[0]

            words = hook.split()
            if len(words) > 15:
                hook = " ".join(words[:12])

            return hook.upper()
        except Exception as e:
            print(f"Hook generation error: {e}")
            return "WATCH UNTIL THE END 🤯"
