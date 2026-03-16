class ClipSelector:
    def __init__(self, min_duration=15, max_duration=60):
        self.min_duration = min_duration
        self.max_duration = max_duration

    def select_clips(self, highlight_scores, count=3):
        # Sort by score descending
        sorted_segments = sorted(highlight_scores, key=lambda x: x['score'], reverse=True)

        selected_clips = []
        for segment in sorted_segments:
            if len(selected_clips) >= count:
                break

            start = segment['start']
            end = segment['end']
            duration = end - start

            # Expand clip to reach min_duration if needed
            if duration < self.min_duration:
                center = (start + end) / 2
                start = max(0, center - self.min_duration / 2)
                end = start + self.min_duration

            # Ensure not longer than max_duration
            if end - start > self.max_duration:
                end = start + self.max_duration

            # Check for overlap with already selected clips
            overlap = False
            for clip in selected_clips:
                if not (end <= clip['start'] or start >= clip['end']):
                    overlap = True
                    break

            if not overlap:
                selected_clips.append({
                    "start": start,
                    "end": end,
                    "score": segment['score'],
                    "text": segment['text']
                })

        # Sort clips by their start time for chronological order (optional, but good for main pipeline)
        return sorted(selected_clips, key=lambda x: x['start'])
