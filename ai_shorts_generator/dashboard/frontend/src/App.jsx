import React, { useState, useEffect } from 'react';
import axios from 'axios';
import YouTubeInput from './components/YouTubeInput';
import VideoVerification from './components/VideoVerification';
import GenerationOptions from './components/GenerationOptions';
import ProgressDisplay from './components/ProgressDisplay';
import ClipGrid from './components/ClipGrid';
import CreativeControls from './components/CreativeControls';
import { Play, Eye, Sparkles, AlertCircle } from 'lucide-react';

const App = () => {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [shortCount, setShortCount] = useState(3);
  const [exportPath, setExportPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPreviews, setIsGeneratingPreviews] = useState(false);
  const [isFinalGenerating, setIsFinalGenerating] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  const [clips, setClips] = useState([]);
  const [approvedClipIds, setApprovedClipIds] = useState([]);

  const [creativeSettings, setCreativeSettings] = useState(() => {
    const saved = localStorage.getItem('creativeSettings');
    return saved ? JSON.parse(saved) : {
      mood: 'serious',
      music_style: 'auto',
      ending_style: 'hard_cut',
      caption_style: 'viral',
      clip_length_preference: 30,
      editing_intensity: 3
    };
  });

  useEffect(() => {
    localStorage.setItem('creativeSettings', JSON.stringify(creativeSettings));
  }, [creativeSettings]);

  const fetchVideoInfo = async () => {
    if (!url) return;
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
    setupWebSocket();

    try {
      const response = await axios.post('/api/generate_previews', {
        url,
        preferred_duration: creativeSettings.clip_length_preference
      });
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
    setApprovedClipIds([]);
    setError('');
  };

  const toggleClipApproval = (id, approved) => {
    if (approved) {
      if (!approvedClipIds.includes(id)) {
        setApprovedClipIds([...approvedClipIds, id]);
      }
    } else {
      setApprovedClipIds(approvedClipIds.filter(cid => cid !== id));
    }
  };

  const applyPreset = (preset) => {
    setCreativeSettings(prev => ({
      ...prev,
      ...preset
    }));
  };

  const startGeneration = async () => {
    if (!exportPath) {
      setError('Please select an export folder.');
      return;
    }
    setIsFinalGenerating(true);
    setupWebSocket();

    const selectedClipsData = clips.filter(c => approvedClipIds.includes(c.id));

    try {
      await axios.post('/api/generate_shorts', {
        url,
        short_count: shortCount,
        export_path: exportPath,
        selected_clips: selectedClipsData.slice(0, shortCount),
        ...creativeSettings
      });
    } catch (err) {
      setError('Generation failed to start.');
      setIsFinalGenerating(false);
    }
  };

  useEffect(() => {
    if (progress?.percentage === 100) {
      setIsFinalGenerating(false);
    }
  }, [progress]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 pb-32">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <Sparkles className="text-white" size={40} />
          </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tight mb-3">
            Shorts<span className="text-blue-600">AI</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
            The automated pipeline to turn long-form content into viral vertical shorts.
          </p>
        </header>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl shadow-md animate-in fade-in slide-in-from-top-2 duration-300 flex items-start gap-4">
            <AlertCircle className="text-red-500 shrink-0" size={24} />
            <div>
              <h3 className="font-bold text-red-800">Something went wrong</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="grid gap-8">
          <section className="space-y-6">
            <YouTubeInput
              url={url}
              setUrl={setUrl}
              onFetchInfo={fetchVideoInfo}
              isLoading={isLoading}
              disabled={isConfirmed}
            />

            {!isConfirmed && (
              <VideoVerification
                videoInfo={videoInfo}
                onConfirm={handleConfirm}
                onClear={handleClear}
              />
            )}
          </section>

          {isConfirmed && clips.length === 0 && !isGeneratingPreviews && (
            <div className="flex justify-center py-10">
              <button
                onClick={generatePreviews}
                className="bg-blue-600 hover:bg-blue-700 text-white text-2xl font-black py-6 px-16 rounded-2xl shadow-xl flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:bg-slate-300"
              >
                <Eye size={32} /> Generate Clip Previews
              </button>
            </div>
          )}

          {isGeneratingPreviews && (
            <div className="text-center py-24 bg-white rounded-[2rem] shadow-2xl border border-slate-100 animate-pulse">
              <div className="inline-block animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600 mb-8"></div>
              <h2 className="text-3xl font-black text-slate-800 mb-2">Analyzing Viral Potential</h2>
              <p className="text-slate-500 text-lg">Scanning audio, motion, and transcript for the best moments...</p>
              {progress && <div className="max-w-md mx-auto mt-8 px-6"><ProgressDisplay progress={progress} /></div>}
            </div>
          )}

          {clips.length > 0 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <ClipGrid
                clips={clips}
                approvedClipIds={approvedClipIds}
                onToggleApproval={toggleClipApproval}
                onSelectAll={() => setApprovedClipIds(clips.map(c => c.id))}
                onDeselectAll={() => setApprovedClipIds([])}
                targetShortCount={shortCount}
              />

              <CreativeControls
                settings={creativeSettings}
                setSettings={setCreativeSettings}
                onApplyPreset={applyPreset}
              />

              <div className="space-y-10">
                <GenerationOptions
                  shortCount={shortCount}
                  setShortCount={setShortCount}
                  exportPath={exportPath}
                  setExportPath={setExportPath}
                  disabled={isFinalGenerating}
                />

                <div className="flex justify-center sticky bottom-10 z-50 px-4">
                  <button
                    onClick={startGeneration}
                    disabled={approvedClipIds.length === 0 || !exportPath || isFinalGenerating}
                    className="group relative w-full md:w-3/4 flex justify-center py-8 px-10 border border-transparent text-3xl font-black rounded-3xl text-white bg-green-600 hover:bg-green-700 shadow-2xl transition-all transform hover:-translate-y-2 active:translate-y-0 disabled:bg-slate-300 disabled:transform-none disabled:shadow-none overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Play className="mr-4" size={40} fill="currentColor" />
                    {isFinalGenerating ? 'Rendering Shorts...' : 'Start Final Generation'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {progress && (isFinalGenerating || progress.percentage === 100) && (
            <div className="max-w-3xl mx-auto w-full">
              <ProgressDisplay progress={progress} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
