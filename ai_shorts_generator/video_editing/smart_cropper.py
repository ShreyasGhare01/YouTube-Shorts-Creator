import cv2
import numpy as np

class SmartCropper:
    def __init__(self):
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    def get_crop_center(self, frame):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)

        h, w, _ = frame.shape

        if len(faces) > 0:
            (x, y, fw, fh) = faces[0]
            center_x = x + fw / 2
            center_y = y + fh / 2
            return center_x, center_y

        return w / 2, h / 2

    def get_smoothed_center_at_time(self, t, smoothed_centers, duration):
        idx_float = t / 0.5
        idx_low = int(idx_float)
        idx_high = min(idx_low + 1, len(smoothed_centers) - 1)

        alpha = idx_float - idx_low

        c_low = smoothed_centers[idx_low]
        c_high = smoothed_centers[idx_high]

        cx = (1 - alpha) * c_low[0] + alpha * c_high[0]
        cy = (1 - alpha) * c_low[1] + alpha * c_high[1]

        return cx, cy

    def process_video_crops(self, video_clip):
        centers = []
        for t in np.arange(0, video_clip.duration, 0.5):
            frame = video_clip.get_frame(t)
            centers.append(self.get_crop_center(frame))

        if not centers:
            return [(video_clip.w / 2, video_clip.h / 2)]

        smoothed_centers = []
        window_size = 3
        for i in range(len(centers)):
            start = max(0, i - window_size)
            end = min(len(centers), i + window_size + 1)
            avg_x = np.mean([c[0] for c in centers[start:end]])
            avg_y = np.mean([c[1] for c in centers[start:end]])
            smoothed_centers.append((avg_x, avg_y))

        return smoothed_centers
