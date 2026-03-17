import React, { useState, useEffect } from 'react';
import axios from 'axios';
import YouTubeInput from './components/YouTubeInput';
import VideoVerification from './components/VideoVerification';
import GenerationOptions from './components/GenerationOptions';
import ProgressDisplay from './components/ProgressDisplay';
import ClipGrid from './components/ClipGrid';
import { Play, Eye, Sparkles } from 'lucide-react';

const App = () => {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [shortCount, setShortCount] = useState(3);
  const [exportPath, setExportPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPreviews, setIsGeneratingPreviews] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  const [clips, setClips] = useState([]);
  const [approvedClipIds, setApprovedClipIds] = useState([]);

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

  const generatePreviews = async () => {
    setIsGeneratingPreviews(true);
    setError('');
    setClips([]);

    // Setup WS for preview progress
    setupWebSocket();

    try {
      const response = await axios.post('/api/generate_previews', { url });
      setClips(response.data.clips);
      setApprovedClipIds(response.data.clips.map(c => c.id));
    } catch (err) {
      setError('Error generating previews. Please retry.');
    } finally {
      setIsGeneratingPreviews(false);
    }
  };

  const setupWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws/progress?task_id=${encodeURIComponent(url)}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProgress(data);
    };
  };

  const handleConfirm = () => setIsConfirmed(true);
  const handleClear = () => {
    setVideoInfo(null);
    setIsConfirmed(false);
    setUrl('');
    setProgress(null);
    setClips([]);
  };

  const toggleClipApproval = (id, approved) => {
    if (approved) {
      setApprovedClipIds([...approvedClipIds, id]);
    } else {
      setApprovedClipIds(approvedClipIds.filter(cid => cid !== id));
    }
  };

  const startGeneration = async () => {
    if (!exportPath) {
      setError('Please select an export folder.');
      return;
    }

    setupWebSocket();

    const selectedClipsData = clips.filter(c => approvedClipIds.includes(c.id));

    try {
      await axios.post('/api/generate_shorts', {
        url,
        short_count: shortCount,
        export_path: exportPath,
        selected_clips: selectedClipsData.slice(0, shortCount) // Take only what we need
      });
    } catch (err) {
      setError('Generation failed to start.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pb-32">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-2 flex items-center justify-center gap-3">
            <Sparkles className="text-blue-600" size={48} />
            AI Shorts Generator
          </h1>
          <p className="text-xl text-gray-500 font-medium tracking-wide">Convert long videos into viral moments</p>
        </header>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm animate-bounce">
            <p className="text-red-700 font-bold">{error}</p>
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

        {isConfirmed && clips.length === 0 && !isGeneratingPreviews && (
          <div className="flex justify-center py-10 animate-in fade-in zoom-in duration-500">
            <button
              onClick={generatePreviews}
              className="bg-blue-600 hover:bg-blue-700 text-white text-2xl font-black py-6 px-12 rounded-2xl shadow-2xl flex items-center gap-4 transition-all hover:scale-105 active:scale-95"
            >
              <Eye size={32} /> Generate Clip Previews
            </button>
          </div>
        )}

        {isGeneratingPreviews && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-xl border border-gray-100">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800">Generating Previews...</h2>
            <p className="text-gray-500 mt-2 italic">Scanning video for viral moments and extracting low-res clips</p>
            {progress && <div className="max-w-md mx-auto mt-6"><ProgressDisplay progress={progress} /></div>}
          </div>
        )}

        {clips.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <ClipGrid
              clips={clips}
              approvedClipIds={approvedClipIds}
              onToggleApproval={toggleClipApproval}
              onSelectAll={() => setApprovedClipIds(clips.map(c => c.id))}
              onDeselectAll={() => setApprovedClipIds([])}
              targetShortCount={shortCount}
            />

            <div className="mt-12 space-y-8">
              <GenerationOptions
                shortCount={shortCount}
                setShortCount={setShortCount}
                exportPath={exportPath}
                setExportPath={setExportPath}
                disabled={false}
              />

              <div className="flex justify-center sticky bottom-10 z-50">
                <button
                  onClick={startGeneration}
                  disabled={approvedClipIds.length === 0 || !exportPath || (progress?.percentage < 100 && progress?.step === 'Editing')}
                  className="group relative w-full md:w-2/3 flex justify-center py-6 px-8 border border-transparent text-2xl font-black rounded-2xl text-white bg-green-600 hover:bg-green-700 shadow-2xl transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:bg-gray-400 disabled:transform-none"
                >
                  <Play className="mr-3" size={32} />
                  {progress?.percentage === 100 ? 'Generate More Shorts' : 'Start Final Generation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {progress && clips.length > 0 && <ProgressDisplay progress={progress} />}
      </div>
    </div>
  );
};

export default App;
