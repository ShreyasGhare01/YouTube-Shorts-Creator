import json
import os

class MetadataGenerator:
    def __init__(self, export_dir='ai_shorts_generator/export'):
        self.export_dir = export_dir
        if not os.path.exists(self.export_dir):
            os.makedirs(self.export_dir)

    def generate(self, clip_text, video_info):
        """
        Generates optimized title, description, and tags for a YouTube Short.
        """
        title = self._create_title(clip_text)
        description = self._create_description(clip_text, video_info)
        tags = self._generate_tags(clip_text)

        return {
            "title": title,
            "description": description,
            "tags": tags,
            "category": video_info.get('category', 'Entertainment')
        }

    def _create_title(self, text):
        # AI Hook: Extract most interesting part and add emojis
        title = text.strip()[:60] + " 🤯 #shorts"
        return title

    def _create_description(self, text, video_info):
        description = f"Check out this viral moment! \n\n"
        description += f"Original: {video_info.get('webpage_url', 'N/A')}\n\n"
        description += "#shorts #viral #ai"
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
