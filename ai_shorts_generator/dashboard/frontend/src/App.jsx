import React, { useState, useEffect } from 'react';
import axios from 'axios';
import YouTubeInput from './components/YouTubeInput';
import VideoVerification from './components/VideoVerification';
import GenerationOptions from './components/GenerationOptions';
import ProgressDisplay from './components/ProgressDisplay';
import ClipGrid from './components/ClipGrid';
import CreativeControls from './components/CreativeControls';
import HelpSection from './components/HelpSection';
import ViralAnalytics from './components/ViralAnalytics';
import { Play, Eye, Sparkles, AlertCircle, LayoutDashboard, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-slate-50 pb-32 selection:bg-blue-100">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
             <Sparkles className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            Shorts<span className="text-blue-600">AI</span>
          </span>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'help' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <HelpCircle size={18} /> How It Works
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              <header className="max-w-3xl">
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-4">
                  Create Viral Shorts <span className="text-blue-600 block md:inline">Instantly.</span>
                </h1>
                <p className="text-xl text-slate-500 font-medium leading-relaxed">
                  The automated pipeline to turn long-form content into viral vertical shorts. Powered by over 15+ specialized AI models.
                </p>
              </header>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-100 p-6 rounded-[2rem] shadow-xl shadow-red-500/5 flex items-start gap-5"
                >
                  <div className="bg-red-500 p-3 rounded-2xl text-white shadow-lg shadow-red-500/20">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-red-900 uppercase tracking-tight text-sm mb-1">Processing Error</h3>
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </motion.div>
              )}

              <div className="grid gap-12">
                <section className="space-y-8">
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
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center py-10"
                  >
                    <button
                      onClick={generatePreviews}
                      className="group relative bg-blue-600 hover:bg-blue-700 text-white text-3xl font-black py-8 px-20 rounded-[2.5rem] shadow-2xl shadow-blue-500/30 flex items-center gap-6 transition-all hover:scale-[1.03] active:scale-[0.97]"
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Eye size={40} strokeWidth={2.5} /> Generate Clip Previews
                    </button>
                  </motion.div>
                )}

                {isGeneratingPreviews && (
                  <div className="text-center py-32 bg-white rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-50/30 group-hover:bg-blue-50/50 transition-colors duration-1000" />
                    <div className="relative">
                      <div className="inline-block animate-spin rounded-full h-24 w-24 border-t-[6px] border-b-[6px] border-blue-600 mb-10 shadow-xl shadow-blue-500/20"></div>
                      <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Analyzing Viral Potential</h2>
                      <p className="text-slate-500 text-xl font-medium">Scanning audio, motion, and transcript for the best moments...</p>
                      {progress && <div className="max-w-2xl mx-auto mt-12 px-6"><ProgressDisplay progress={progress} /></div>}
                    </div>
                  </div>
                )}

                {clips.length > 0 && (
                  <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <ViralAnalytics clips={clips} />

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

                    <div className="space-y-12">
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
                          className="group relative w-full md:w-4/5 flex justify-center py-10 px-12 border border-transparent text-4xl font-black rounded-[2.5rem] text-white bg-green-600 hover:bg-green-700 shadow-2xl shadow-green-600/30 transition-all transform hover:-translate-y-2 active:translate-y-0 disabled:bg-slate-300 disabled:transform-none disabled:shadow-none overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <Play className="mr-6" size={48} fill="currentColor" />
                          {isFinalGenerating ? 'Rendering Shorts...' : 'Finalize & Render'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {progress && (isFinalGenerating || progress.percentage === 100) && (
                  <div className="max-w-4xl mx-auto w-full">
                    <ProgressDisplay progress={progress} />
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="help"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <HelpSection />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
