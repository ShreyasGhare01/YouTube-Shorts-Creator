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
import { Play, Eye, Sparkles, AlertCircle, LayoutDashboard, HelpCircle, Link as LinkIcon, CheckCircle, Info } from 'lucide-react';
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
    <div className="min-h-screen bg-bg text-text selection:bg-accent/30">
      {/* Ambient Blobs */}
      <div className="blob w-[500px] h-[500px] bg-accent/5 top-[-150px] right-[-100px]" />
      <div className="blob w-[400px] h-[400px] bg-accent2/5 bottom-[100px] left-[-120px] [animation-delay:-5s]" />
      <div className="blob w-[300px] h-[300px] bg-blue-500/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [animation-delay:-3s]" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[500] flex items-center justify-between px-6 md:px-12 py-4 backdrop-blur-2xl bg-bg/70 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center animate-pulse-glow shadow-[0_0_20px_rgba(232,255,71,0.2)]">
             <Play className="text-bg" size={16} fill="currentColor" />
          </div>
          <span className="font-syne font-extrabold text-xl tracking-tight">
            Shorts<span className="text-accent">AI</span>
          </span>
        </div>

        <div className="flex bg-surface2/50 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-surface2 text-accent shadow-lg' : 'text-muted hover:text-text'}`}
          >
            <LayoutDashboard size={16} /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'help' ? 'bg-surface2 text-accent shadow-lg' : 'text-muted hover:text-text'}`}
          >
            <HelpCircle size={16} /> How It Works
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-16"
            >
              <header className="text-center max-w-3xl mx-auto space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/5 text-accent text-[10px] uppercase font-bold tracking-widest"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  Powered by 15+ specialized AI models
                </motion.div>

                <h1 className="text-6xl md:text-7xl font-syne font-extrabold tracking-tighter leading-[0.95]">
                  Create <span className="text-transparent bg-clip-text bg-gradient-to-br from-accent to-[#aaff00]">Viral Shorts</span> Instantly.
                </h1>

                <p className="text-lg text-muted font-light leading-relaxed max-w-xl mx-auto">
                  The automated pipeline to turn long-form content into viral vertical shorts — optimized for engagement and reach.
                </p>

                <div className="flex items-center justify-center gap-4 text-xs text-muted">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent2 animate-pip-wave" />
                    <div className="w-1.5 h-1.5 rounded-full bg-accent2 animate-pip-wave [animation-delay:0.15s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-accent2 animate-pip-wave [animation-delay:0.3s]" />
                  </div>
                  Scene detection · Auto-captioning · Viral scoring · Face tracking
                </div>
              </header>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-4 text-red-400"
                >
                  <AlertCircle size={20} />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}

              <div className="space-y-12">
                {/* Step 1: URL Input */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest">
                    <div className="w-5 h-5 rounded-md bg-surface2 border border-white/5 flex items-center justify-center text-accent">1</div>
                    YouTube Video Link
                  </div>

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
                    className="flex justify-center"
                  >
                    <button
                      onClick={generatePreviews}
                      className="group relative px-8 py-4 bg-accent hover:bg-accent/90 text-bg font-syne font-bold rounded-xl shadow-[0_0_30px_rgba(232,255,71,0.2)] transition-all hover:-translate-y-1 active:translate-y-0 flex items-center gap-3"
                    >
                      <Eye size={20} strokeWidth={2.5} /> Generate Clip Previews
                    </button>
                  </motion.div>
                )}

                {isGeneratingPreviews && (
                  <div className="glass-card p-12 text-center space-y-8">
                    <div className="relative inline-block">
                      <div className="w-20 h-20 rounded-full border-t-2 border-r-2 border-accent animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="text-accent" size={24} />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-syne font-bold mb-2">Analyzing Viral Potential</h2>
                      <p className="text-muted text-sm">Scanning audio, motion, and transcript for the best moments...</p>
                    </div>
                    {progress && <div className="max-w-md mx-auto"><ProgressDisplay progress={progress} /></div>}
                  </div>
                )}

                {clips.length > 0 && (
                  <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <ViralAnalytics clips={clips} />

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest">
                            <div className="w-5 h-5 rounded-md bg-surface2 border border-white/5 flex items-center justify-center text-accent">2</div>
                            Review & Select Clips
                         </div>
                      </div>
                      <ClipGrid
                        clips={clips}
                        approvedClipIds={approvedClipIds}
                        onToggleApproval={toggleClipApproval}
                        onSelectAll={() => setApprovedClipIds(clips.map(c => c.id))}
                        onDeselectAll={() => setApprovedClipIds([])}
                        targetShortCount={shortCount}
                      />
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest">
                        <div className="w-5 h-5 rounded-md bg-surface2 border border-white/5 flex items-center justify-center text-accent">3</div>
                        Creative Controls
                      </div>
                      <CreativeControls
                        settings={creativeSettings}
                        setSettings={setCreativeSettings}
                        onApplyPreset={applyPreset}
                      />
                    </div >

                    <div className="space-y-12">
                      <GenerationOptions
                        shortCount={shortCount}
                        setShortCount={setShortCount}
                        exportPath={exportPath}
                        setExportPath={setExportPath}
                        disabled={isFinalGenerating}
                      />

                      <div className="flex justify-center pt-8">
                        <button
                          onClick={startGeneration}
                          disabled={approvedClipIds.length === 0 || !exportPath || isFinalGenerating}
                          className="group relative w-full max-w-lg py-5 bg-green-500 hover:bg-green-400 disabled:bg-surface2 text-bg font-syne font-bold text-xl rounded-2xl shadow-xl shadow-green-500/20 transition-all hover:-translate-y-1 active:translate-y-0 flex justify-center items-center gap-4"
                        >
                          <Play size={24} fill="currentColor" />
                          {isFinalGenerating ? 'Rendering Shorts...' : 'Finalize & Render'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {progress && (isFinalGenerating || progress.percentage === 100) && (
                  <div className="max-w-2xl mx-auto w-full pt-12">
                    <ProgressDisplay progress={progress} />
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="help"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <HelpSection />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-8 px-12 flex flex-col md:flex-row items-center justify-between text-[11px] text-muted tracking-wider uppercase font-bold">
        <span>© 2025 ShortsAI. All rights reserved.</span>
        <div className="flex gap-8 mt-4 md:mt-0">
          <a href="#" className="hover:text-accent transition-colors">Privacy</a>
          <a href="#" className="hover:text-accent transition-colors">Terms</a>
          <a href="#" className="hover:text-accent transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
