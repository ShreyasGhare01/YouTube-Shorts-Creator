import React, { useState, useEffect } from 'react';
import axios from 'axios';
import YouTubeInput from './components/YouTubeInput';
import VideoVerification from './components/VideoVerification';
import GenerationOptions from './components/GenerationOptions';
import ProgressDisplay from './components/ProgressDisplay';
import { Play } from 'lucide-react';

const App = () => {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [shortCount, setShortCount] = useState(3);
  const [exportPath, setExportPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  const fetchVideoInfo = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/get_video_info', { url });
      setVideoInfo(response.data);
    } catch (err) {
      setError('Error: Could not read YouTube video. Please check the link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => setIsConfirmed(true);
  const handleClear = () => {
    setVideoInfo(null);
    setIsConfirmed(false);
    setUrl('');
    setProgress(null);
  };

  const startGeneration = async () => {
    if (!exportPath) {
      setError('Please select an export folder.');
      return;
    }

    // Setup WebSocket
    const ws = new WebSocket(`ws://${window.location.host}/ws/progress?task_id=${encodeURIComponent(url)}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProgress(data);
    };

    try {
      await axios.post('/api/generate_shorts', {
        url,
        short_count: shortCount,
        export_path: exportPath
      });
    } catch (err) {
      setError('Generation failed to start.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-2">
            AI Shorts Generator
          </h1>
          <p className="text-xl text-gray-600">Convert long videos into viral moments</p>
        </header>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm animate-bounce">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <YouTubeInput
          url={url}
          setUrl={setUrl}
          onFetchInfo={fetchVideoInfo}
          isLoading={isLoading}
        />

        {!isConfirmed && (
          <VideoVerification
            videoInfo={videoInfo}
            onConfirm={handleConfirm}
            onClear={handleClear}
          />
        )}

        <GenerationOptions
          shortCount={shortCount}
          setShortCount={setShortCount}
          exportPath={exportPath}
          setExportPath={setExportPath}
          disabled={!isConfirmed}
        />

        <div className="flex justify-center">
          <button
            onClick={startGeneration}
            disabled={!isConfirmed || !exportPath || progress?.percentage < 100}
            className="group relative w-full md:w-2/3 flex justify-center py-4 px-6 border border-transparent text-xl font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0"
          >
            <Play className="mr-2" size={24} />
            {progress ? 'Generate More' : 'Generate Shorts'}
          </button>
        </div>

        <ProgressDisplay progress={progress} />
      </div>
    </div>
  );
};

export default App;
