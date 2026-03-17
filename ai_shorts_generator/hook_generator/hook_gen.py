from transformers import pipeline

class HookGenerator:
    def __init__(self):
        self.generator = pipeline("text-generation", model="distilgpt2")

    def generate_hook(self, transcript_text):
        prompt = f"""Given the following transcript from a video clip,
generate a highly engaging 1-sentence hook that
makes viewers want to keep watching.

Rules:
- under 12 words
- high curiosity
- emotionally engaging

Transcript:
{transcript_text}

Hook:"""

        response = self.generator(prompt, max_new_tokens=20, num_return_sequences=1)
        hook = response[0]['generated_text'].split("Hook:")[-1].strip()

        hook = hook.split('\n')[0]
        words = hook.split()
        if len(words) > 12:
            hook = " ".join(words[:12])

        return hook.upper()
