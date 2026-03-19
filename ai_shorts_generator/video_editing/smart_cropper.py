import cv2
import numpy as np

class SmartCropper:
    def __init__(self):
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    def get_crop_center(self, frame, previous_center=None):
        """
        Determines the crop center based on detected faces, supporting focus switching
        for multiple speakers.
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)

        h, w, _ = frame.shape

        if len(faces) > 0:
            # Sort faces by size (proxy for focus/closeness)
            faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)

            # Focus on the most prominent face or the one closest to the previous focus
            if previous_center and len(faces) > 1:
                # Switching logic: only switch focus if the new face is significantly closer
                # or if the current focus is lost.
                target_face = faces[0]
                for f in faces:
                    fx, fy = f[0] + f[2]/2, f[1] + f[3]/2
                    dist = np.sqrt((fx - previous_center[0])**2 + (fy - previous_center[1])**2)
                    if dist < 100: # We are still looking at the same speaker
                         target_face = f
                         break
                (x, y, fw, fh) = target_face
            else:
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
        last_center = None
        for t in np.arange(0, video_clip.duration, 0.5):
            frame = video_clip.get_frame(t)
            current_center = self.get_crop_center(frame, previous_center=last_center)
            centers.append(current_center)
            last_center = current_center

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
