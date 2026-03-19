import json
import os

class MetadataGenerator:
    def __init__(self, export_dir='ai_shorts_generator/export'):
        self.export_dir = export_dir
        if not os.path.exists(self.export_dir):
            os.makedirs(self.export_dir)

    def generate(self, clip_text, video_info, num_variants=3):
        """
        Generates optimized title, description, and tags with A/B testing variants.
        """
        variants = []
        for i in range(num_variants):
            title = self._create_title(clip_text, variant_id=i)
            description = self._create_description(clip_text, video_info, variant_id=i)
            tags = self._generate_tags(clip_text)

            variants.append({
                "variant_id": i,
                "title": title,
                "description": description,
                "tags": tags
            })

        return {
            "variants": variants,
            "category": video_info.get('category', 'Entertainment')
        }

    def _create_title(self, text, variant_id=0):
        # Different "hooks" based on variant_id
        hooks = ["🤯", "🔥", "😱", "🤔", "🤫"]
        prefixes = ["You won't believe this ", "Wait for the end ", "The secret to ", "This was insane ", "Check this out "]

        prefix = prefixes[variant_id % len(prefixes)]
        emoji = hooks[variant_id % len(hooks)]

        title = f"{prefix}{text.strip()[:40]}{emoji} #shorts"
        return title

    def _create_description(self, text, video_info, variant_id=0):
        styles = [
            "Check out this viral moment! \n\n#shorts #viral #ai",
            "I was NOT expecting this to happen... 😱 \n\n#shorts #omg #viral",
            "This experiment just changed everything. \n\n#shorts #science #viral"
        ]
        description = styles[variant_id % len(styles)]
        description += f"\n\nOriginal: {video_info.get('webpage_url', 'N/A')}"
        return description

    def _generate_tags(self, text):
        # Simple tag extraction from transcript
        words = [w.lower() for w in text.split() if len(w) > 4]
        tags = ["shorts", "viral"] + list(set(words))[:10]
        return tags

    def save_metadata(self, metadata, filepath):
        """
        Saves the generated metadata to a JSON file.
        """
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=4)
        return filepath
