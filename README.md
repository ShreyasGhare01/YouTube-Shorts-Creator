# AI YouTube Shorts Generator

An automated AI-powered pipeline that converts long-form YouTube videos into high-quality, engaging vertical Shorts ready for upload.

## 🚀 What This Program Does

The AI YouTube Shorts Generator uses state-of-the-art AI models to analyze videos, detect the most engaging moments, and automatically edit them into vertical 9:16 videos.

### Key Features

*   **Viral Moment Scoring:** Automatically identifies the best clips using a multi-signal model that analyzes:
    *   **Audio Intensity:** Detects excitement, volume spikes, and emotional emphasis.
    *   **Sentiment Analysis:** Scans the transcript for controversial, surprising, or high-emotion language.
    *   **Visual Motion:** Finds high-action scenes and dynamic visual changes.
    *   **Keyword Detection:** Prioritizes viral triggers like "crazy," "unbelievable," or "watch this."
*   **AI Hook Generator:** Uses an LLM to generate a curiosity-driven "Hook" sentence that appears in the first 2.5 seconds to maximize viewer retention.
*   **Smart Face-Tracking Crop:** Uses computer vision to detect faces and objects, smoothly tracking the main subject while converting horizontal video to vertical (9:16).
*   **Dynamic Captions:** Automatically generates word-by-word burned-in captions with viral-style styling.
*   **Clip Preview Mode:** A human-in-the-loop dashboard where you can watch the top 20 detected moments and choose exactly which ones to render as final Shorts.
*   **Parallel Processing:** Optimized backend that transcribes and analyzes audio/visual signals concurrently for maximum speed.

---

## 🛠 Setup Instructions

### 1. Prerequisites
Make sure you have the following installed on your computer:
*   **Python 3.8 or higher**
*   **Node.js & npm** (for the web dashboard)

### 2. Install Dependencies
Open your terminal in the project root directory and run:
```bash
pip install -r ai_shorts_generator/requirements.txt
```

### 3. Frontend Setup
Navigate to the frontend directory and install the necessary packages:
```bash
cd ai_shorts_generator/dashboard/frontend
npm install
cd ../../../
```

---

## 💻 How to Use (Step-by-Step)

### Option A: Using the Web Dashboard (Recommended)

This is the easiest way to use the program, allowing you to preview and select clips before they are generated.

1.  **Start the Backend Server:**
    Open a terminal and run:
    ```bash
    PYTHONPATH=. uvicorn ai_shorts_generator.dashboard.backend.main:app --port 8000
    ```
2.  **Start the Frontend Dashboard:**
    Open a *second* terminal, navigate to the frontend folder, and run:
    ```bash
    cd ai_shorts_generator/dashboard/frontend
    npm run dev
    ```
3.  **Open the Dashboard:**
    Visit `http://localhost:3000` in your web browser.
4.  **Process a Video:**
    *   **Paste a YouTube Link** into the input box and click "Get Info".
    *   **Verify the Title** and click "Confirm".
    *   Click **"Generate Clip Previews"**. The AI will now analyze the video and create low-resolution previews of the top moments.
    *   **Review Clips:** Scroll through the grid, watch the previews, and click "Approve" or "Reject".
    *   **Select Shorts Count:** Choose how many final Shorts you want (e.g., 3).
    *   **Set Export Folder:** Type the folder path where you want the final videos saved.
    *   **Click "Start Final Generation":** The AI will now render high-quality vertical videos with hooks, smart cropping, and captions.

### Option B: Using the Command Line (CLI)

For power users who want to generate shorts automatically without a preview.

1.  Open your terminal in the root directory.
2.  Run the following command:
    ```bash
    PYTHONPATH=. python ai_shorts_generator/main.py --url https://youtube.com/watch?v=EXAMPLE --count 3
    ```
3.  The generated shorts, thumbnails, and metadata will be available in the `ai_shorts_generator/export/` directory.

---

## 📂 Project Structure

*   `ai_shorts_generator/`
    *   `download/`: Video/Audio retrieval logic.
    *   `transcription/`: Whisper AI speech-to-text.
    *   `highlight_detection/`: Viral scoring AI models.
    *   `hook_generator/`: LLM-based hook generation.
    *   `video_editing/`: Smart cropping and MoviePy logic.
    *   `captioning/`: Dynamic text overlay engine.
    *   `export/`: Final generated output.
    *   `dashboard/`: FastAPI backend and React frontend.
    *   `utils/`: Core pipeline orchestration.
