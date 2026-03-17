import json
import os

class MetadataGenerator:
    def generate(self, clip_text, video_info):
        title = clip_text[:50] + "..." if len(clip_text) > 50 else clip_text
        if not title:
            title = video_info.get('title', 'AI Generated Short')

        metadata = {
            "title": f"{title.upper()} #shorts #viral",
            "description": f"Check out this highlight! \n\nOriginal video: {video_info.get('webpage_url', '')} \n\n#shorts #viral #ai",
            "tags": ["shorts", "viral", "ai", "highlight"]
        }
        return metadata

    def save_metadata(self, metadata, output_path):
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=4)
