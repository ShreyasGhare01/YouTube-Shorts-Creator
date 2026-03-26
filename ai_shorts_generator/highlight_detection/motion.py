import cv2
import numpy as np

class MotionDetector:
    def analyze_motion(self, video_path, sample_rate=1.0):
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        if fps == 0: fps = 24

        motion_scores = []
        ret, prev_frame = cap.read()
        if not ret:
            cap.release()
            return []

        # Resize for performance
        prev_frame_small = cv2.resize(prev_frame, (160, 90))
        prev_gray = cv2.cvtColor(prev_frame_small, cv2.COLOR_BGR2GRAY)

        frame_idx = 0
        while True:
            skip = int(fps * sample_rate)
            for _ in range(skip):
                cap.grab()
                frame_idx += 1

            ret, frame = cap.read()
            if not ret:
                break
            frame_idx += 1

            # Resize for performance
            frame_small = cv2.resize(frame, (160, 90))
            gray = cv2.cvtColor(frame_small, cv2.COLOR_BGR2GRAY)
            diff = cv2.absdiff(prev_gray, gray)
            motion_score = np.mean(diff)

            timestamp = frame_idx / fps
            motion_scores.append((timestamp, motion_score))

            prev_gray = gray

        cap.release()
        return motion_scores
