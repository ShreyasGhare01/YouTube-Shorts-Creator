# AI YouTube Shorts Generator (Windows Version)

An automated AI-powered pipeline that converts long-form YouTube videos into high-quality, engaging vertical Shorts ready for upload, optimized for Windows.

## 🚀 What This Program Does

The AI YouTube Shorts Generator uses state-of-the-art AI models to analyze videos, detect the most engaging moments, and automatically edit them into vertical 9:16 videos.

### Key Features

*   **Viral Moment Scoring:** Automatically identifies the best clips using a multi-signal model that analyzes audio intensity, sentiment, visual motion, and keywords.
*   **AI Hook Generator:** Uses an LLM to generate a curiosity-driven "Hook" sentence for the opening seconds.
*   **Smart Face-Tracking Crop:** Automatically detects and tracks faces to create perfect vertical crops from horizontal videos.
*   **Clip Preview Mode:** Interactive dashboard to review and approve clips before final rendering.

---

## 🛠 Setup Instructions for Windows

### 1. Prerequisites
Make sure you have the following installed on your Windows machine:
*   **Python 3.10+**: [Download from Python.org](https://www.python.org/downloads/windows/) (Ensure "Add Python to PATH" is checked during installation)
*   **Node.js & npm**: [Download from Nodejs.org](https://nodejs.org/)
*   **ImageMagick (Essential for Captions)**: [Download from ImageMagick.org](https://imagemagick.org/script/download.php#windows)
    *   **CRITICAL:** During installation, check the box: **"Install legacy utilities (e.g. convert)"**.
    *   Restart your computer after installation.

### 2. Install Python Dependencies
Open **Command Prompt** (cmd) or **PowerShell** in the project folder and run:
```cmd
pip install -r ai_shorts_generator\requirements.txt
```

### 3. Setup Frontend Dashboard
In the same terminal, run:
```cmd
cd ai_shorts_generator\dashboard\frontend
npm install
cd ..\..\..\
```

---

## 💻 How to Use on Windows (Step-by-Step)

### Option A: Using the Web Dashboard (Recommended)

1.  **Start the Backend Server:**
    Open a terminal in the root folder and run:
    ```cmd
    set PYTHONPATH=.
    uvicorn ai_shorts_generator.dashboard.backend.main:app --port 8000
    ```
2.  **Start the Frontend Dashboard:**
    Open a **NEW** terminal window, navigate to the frontend folder, and run:
    ```cmd
    cd ai_shorts_generator\dashboard\frontend
    npm run dev
    ```
3.  **Open the Dashboard:**
    Open your browser and go to: `http://localhost:3000`
4.  **Process a Video:**
    *   Paste your YouTube link and click **"Get Info"**.
    *   Click **"Confirm"** once the title is detected.
    *   Click **"Generate Clip Previews"** to see the AI-detected highlights.
    *   Review, Approve/Reject clips in the grid.
    *   Enter an **Export Path** (e.g., `C:\Shorts\MyChannel`) and click **"Start Final Generation"**.

### Option B: Using the Command Line (CLI)

1.  Open a terminal in the project root folder.
2.  Run the following command:
    ```cmd
    set PYTHONPATH=.
    python ai_shorts_generator\main.py --url https://youtube.com/watch?v=EXAMPLE --count 3
    ```
3.  Your finished Shorts will be saved in `ai_shorts_generator\export\`.

---

## 📂 Project Structure

*   `ai_shorts_generator\`
    *   `dashboard\`: Web interface (FastAPI + React).
    *   `highlight_detection\`: AI scoring logic.
    *   `video_editing\`: Smart cropping and rendering.
    *   `hook_generator\`: LLM hook creation.
    *   `export\`: Default output folder.

---

## 📈 Future Roadmap

Looking to scale your AI content creation? Check out our [Future Recommendations & Roadmap](RECOMMENDATIONS.md) for 15 detailed feature improvements, including:
- AI Virality Prediction
- Auto-Posting to YouTube API
- Dynamic B-Roll & Meme Insertion
- Multi-Speaker Face Tracking
