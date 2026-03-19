import os
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google_auth_oauthlib.flow import InstalledAppFlow

class YouTubeUploader:
    """
    Framework for automating YouTube Shorts uploads using the YouTube Data API v3.
    """
    def __init__(self, client_secrets_file='client_secrets.json'):
        self.scopes = ["https://www.googleapis.com/auth/youtube.upload"]
        self.client_secrets_file = client_secrets_file
        self.youtube = None

    def authenticate(self):
        """
        Perform OAuth2 flow for authentication.
        """
        if not os.path.exists(self.client_secrets_file):
            print(f"Auth error: {self.client_secrets_file} not found.")
            return False

        flow = InstalledAppFlow.from_client_secrets_file(self.client_secrets_file, self.scopes)
        credentials = flow.run_local_server(port=0)
        self.youtube = build("youtube", "v3", credentials=credentials)
        return True

    def upload_short(self, video_path, title, description, tags=None):
        """
        Uploads a video to YouTube with Shorts-optimized metadata.
        """
        if not self.youtube:
            if not self.authenticate():
                return None

        body = {
            "snippet": {
                "title": title[:100],
                "description": description,
                "tags": tags,
                "categoryId": "22" # People & Blogs
            },
            "status": {
                "privacyStatus": "public",
                "selfDeclaredMadeForKids": False
            }
        }

        media = MediaFileUpload(video_path, chunksize=-1, resumable=True)

        request = self.youtube.videos().insert(
            part="snippet,status",
            body=body,
            media_body=media
        )

        response = None
        while response is None:
            status, response = request.next_chunk()
            if status:
                print(f"Upload progress: {int(status.progress() * 100)}%")

        print(f"Upload complete! Video ID: {response['id']}")
        return response['id']
