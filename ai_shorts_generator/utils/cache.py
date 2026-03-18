import json
import os
import hashlib

class SignalCache:
    def __init__(self, cache_dir='temp/cache'):
        self.cache_dir = cache_dir
        if not os.path.exists(self.cache_dir):
            os.makedirs(self.cache_dir)

    def _get_cache_key(self, url):
        return hashlib.md5(url.encode()).hexdigest()

    def get(self, url):
        key = self._get_cache_key(url)
        cache_path = os.path.join(self.cache_dir, f"{key}.json")
        if os.path.exists(cache_path):
            with open(cache_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Verify files still exist
                if os.path.exists(data.get('video_path', '')) and os.path.exists(data.get('audio_path', '')):
                    return data
        return None

    def set(self, url, data):
        key = self._get_cache_key(url)
        cache_path = os.path.join(self.cache_dir, f"{key}.json")
        with open(cache_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4)
