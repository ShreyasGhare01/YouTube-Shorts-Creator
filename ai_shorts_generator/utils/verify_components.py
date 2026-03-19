import sys
import os

# Ensure project root is in path
sys.path.append(os.getcwd())

try:
    from ai_shorts_generator.utils.pipeline import ShortsPipeline
    from ai_shorts_generator.export.exporter import Exporter
    from ai_shorts_generator.export.metadata_gen import MetadataGenerator
    from ai_shorts_generator.utils.cache import SignalCache

    def test_pipeline_initialization():
        print("Initializing ShortsPipeline...")
        pipeline = ShortsPipeline()

        # Verify sub-components are present
        assert hasattr(pipeline, 'downloader'), "Downloader missing"
        assert hasattr(pipeline, 'transcriber'), "Transcriber missing"
        assert hasattr(pipeline, 'detector'), "HighlightDetector missing"
        assert hasattr(pipeline, 'editor'), "VideoEditor missing"
        assert hasattr(pipeline, 'captioner'), "CaptionGenerator missing"
        assert hasattr(pipeline, 'metadata_gen'), "MetadataGenerator missing"
        assert hasattr(pipeline, 'hook_gen'), "HookGenerator missing"
        assert hasattr(pipeline, 'cache'), "SignalCache missing"

        print("Checking Export and Cache modules...")
        exporter = Exporter()
        metadata_gen = MetadataGenerator()
        cache = SignalCache()

        print("✅ Pipeline and all core modules are correctly integrated.")

    if __name__ == "__main__":
        test_pipeline_initialization()

except ImportError as e:
    print(f"❌ Integration test failed: Missing module. {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Integration test failed with error: {e}")
    sys.exit(1)
