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
import { Play, Eye, Sparkles, AlertCircle, LayoutDashboard, HelpCircle, TrendingUp, Info, LineChart } from 'lucide-react';
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
  const [showLoader, setShowLoader] = useState(true);

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
    const timer = setTimeout(() => setShowLoader(false), 1100);
    return () => clearTimeout(timer);
  }, []);

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
    <div className="min-h-screen bg-bg text-text selection:bg-accent/30 font-dm">
      <AnimatePresence>
        {showLoader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-bg flex flex-col items-center justify-center gap-4"
          >
            <div className="font-syne text-2xl font-extrabold">ShortsAI ✦</div>
            <div className="w-[140px] h-[0.5px] bg-surface2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className="h-full bg-accent"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient Blobs */}
      <div className="blob w-[500px] h-[500px] bg-accent/5 top-[-150px] right-[-100px]" />
      <div className="blob w-[400px] h-[400px] bg-accent2/5 bottom-[100px] left-[-120px] [animation-delay:-5s]" />
      <div className="blob w-[300px] h-[300px] bg-blue-500/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [animation-delay:-3s]" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[500] flex items-center justify-between px-12 py-[18px] backdrop-blur-[20px] bg-bg/70 border-b border-white/5">
        <a className="flex items-center gap-[10px] font-syne font-extrabold text-[1.15rem] tracking-tight" href="#">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center animate-pulse-glow shadow-[0_0_20px_rgba(232,255,71,0.2)]">
             <Play className="text-bg" size={16} fill="currentColor" />
          </div>
          ShortsAI
        </a>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-[0.875rem] font-medium transition-all flex items-center gap-[7px] ${activeTab === 'dashboard' ? 'bg-surface2 text-text border border-white/5' : 'text-muted hover:text-text hover:bg-surface2'}`}
          >
            <LayoutDashboard size={15} /> Dashboard
          </button>
          <a
            href="#how"
            onClick={() => setActiveTab('dashboard')}
            className="px-4 py-2 rounded-lg text-[0.875rem] font-medium text-muted hover:text-text hover:bg-surface2 transition-all flex items-center gap-[7px]"
          >
            <HelpCircle size={15} /> How It Works
          </a>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-32">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-24"
            >
              <header className="text-center max-w-4xl mx-auto space-y-7 py-12">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-[14px] py-[6px] rounded-full border border-accent/30 bg-accent/7 text-accent text-[0.78rem] uppercase font-medium tracking-[0.06em]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  Powered by 15+ specialized AI models
                </motion.div>

                <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] font-syne font-extrabold tracking-[-0.03em] leading-[1.05]">
                  Create <span className="text-transparent bg-clip-text bg-gradient-to-br from-accent to-[#aaff00]">Viral Shorts</span><br />Instantly.
                </h1>

                <p className="text-[1.05rem] text-muted font-light leading-[1.7] max-w-[520px] mx-auto">
                  The automated pipeline to turn long-form content into viral vertical shorts — optimized for engagement, retention, and reach.
                </p>

                <div className="flex items-center justify-center gap-[10px] text-[0.8rem] text-muted">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent2/70 animate-pip-wave" />
                    <div className="w-1.5 h-1.5 rounded-full bg-accent2/70 animate-pip-wave [animation-delay:0.15s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-accent2/70 animate-pip-wave [animation-delay:0.3s]" />
                  </div>
                  Scene detection · Auto-captioning · Viral scoring · Face tracking
                </div>

                {/* Step 1: URL Input */}
                <div className="pt-14 max-w-[660px] mx-auto space-y-3">
                  <div className="flex items-center gap-[10px] text-[0.75rem] font-bold text-muted uppercase tracking-[0.12em] font-syne">
                    <div className="w-[22px] h-[22px] rounded-md bg-surface2 border border-white/5 flex items-center justify-center text-accent text-[0.7rem]">1</div>
                    YouTube Video Link
                  </div>

                  <YouTubeInput
                    url={url}
                    setUrl={setUrl}
                    onFetchInfo={fetchVideoInfo}
                    isLoading={isLoading}
                    disabled={isConfirmed}
                  />

                  <p className="flex items-center gap-[6px] text-[0.78rem] text-muted text-left">
                    <Info size={13} />
                    Works with any public YouTube video — interviews, podcasts, tutorials, and more.
                  </p>

                  {!isConfirmed && (
                    <VideoVerification
                      videoInfo={videoInfo}
                      onConfirm={handleConfirm}
                      onClear={handleClear}
                    />
                  )}
                </div>
              </header>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex items-center gap-4 text-red-400 max-w-lg mx-auto"
                >
                  <AlertCircle size={24} />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-1">Processing Error</h3>
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </motion.div>
              )}

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
                <div className="glass-card p-20 text-center space-y-10">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full border-t-[6px] border-b-[6px] border-accent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="text-accent" size={32} />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-4xl font-syne font-extrabold tracking-tight mb-3">Analyzing Viral Potential</h2>
                    <p className="text-muted text-xl font-light">Scanning audio, motion, and transcript for the best moments...</p>
                  </div>
                  {progress && <div className="max-w-2xl mx-auto"><ProgressDisplay progress={progress} /></div>}
                </div>
              )}

              {clips.length > 0 && (
                <div className="space-y-32 pb-32">
                  {/* FEATURES / Distribution */}
                  <div className="space-y-14">
                    <div className="text-center space-y-3">
                      <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-syne font-extrabold tracking-tight">Everything you need to go viral.</h2>
                      <p className="text-muted text-lg font-light max-w-[480px] mx-auto">End-to-end automation from raw video to polished, shareable shorts.</p>
                    </div>
                    <ViralAnalytics clips={clips} />
                  </div>

                  {/* Review Clips */}
                  <div className="space-y-10">
                    <div className="flex items-center gap-[10px] text-[0.75rem] font-bold text-muted uppercase tracking-[0.12em] font-syne">
                      <div className="w-[22px] h-[22px] rounded-md bg-surface2 border border-white/5 flex items-center justify-center text-accent text-[0.7rem]">2</div>
                      Review & Select Clips
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

                  {/* Creative Controls */}
                  <div className="space-y-10">
                    <div className="flex items-center gap-[10px] text-[0.75rem] font-bold text-muted uppercase tracking-[0.12em] font-syne">
                      <div className="w-[22px] h-[22px] rounded-md bg-surface2 border border-white/5 flex items-center justify-center text-accent text-[0.7rem]">3</div>
                      Creative Controls
                    </div>
                    <CreativeControls
                      settings={creativeSettings}
                      setSettings={setCreativeSettings}
                      onApplyPreset={applyPreset}
                    />
                  </div >

                  {/* Export Options */}
                  <div className="space-y-16 max-w-4xl mx-auto">
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
                        className="group relative w-full py-6 bg-accent hover:bg-accent/90 disabled:bg-surface2 text-bg font-syne font-extrabold text-2xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(232,255,71,0.3)] transition-all hover:-translate-y-2 active:translate-y-0 flex justify-center items-center gap-5"
                      >
                        <Play size={32} fill="currentColor" />
                        {isFinalGenerating ? 'Rendering Shorts...' : 'Finalize & Render'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* HOW IT WORKS SECTION */}
              <section className="max-w-[780px] mx-auto py-24" id="how">
                <h2 className="text-[clamp(1.8rem,4vw,2.5rem)] font-syne font-extrabold text-center mb-14 tracking-tight">How It Works</h2>
                <div className="space-y-0">
                  <Step num="1" title="Paste your YouTube link" desc="Drop any public YouTube URL — long-form videos, live recordings, podcasts, interviews, or lectures." />
                  <Step num="2" title="AI analyzes the content" desc="15+ specialized models detect scenes, transcribe speech, score moments, and track faces in parallel." />
                  <Step num="3" title="Review your clips" desc="Browse auto-generated short candidates ranked by viral score. Preview, trim, and customize captions." />
                  <Step num="4" title="Export & publish" desc="Download ready-to-post vertical videos or push directly to your connected social accounts." />
                </div>
              </section>

              {progress && (isFinalGenerating || progress.percentage === 100) && (
                <div className="max-w-2xl mx-auto w-full pt-12 pb-24">
                  <ProgressDisplay progress={progress} />
                </div>
              )}
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

      <footer className="relative z-10 border-t border-white/5 py-8 px-12 flex flex-col md:flex-row items-center justify-between text-[0.8rem] text-muted font-light">
        <span>© 2025 ShortsAI. All rights reserved.</span>
        <div className="flex gap-10 mt-4 md:mt-0">
          <a href="#" className="hover:text-accent transition-colors">Privacy</a>
          <a href="#" className="hover:text-accent transition-colors">Terms</a>
          <a href="#" className="hover:text-accent transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
};

const Step = ({ num, title, desc }) => (
  <div className="flex gap-8 py-6 pl-8 border-l border-white/5 relative group">
    <div className="absolute -left-[14.5px] top-6 w-7 h-7 rounded-lg bg-surface2 border border-accent/30 text-accent font-syne font-bold text-[0.8rem] flex items-center justify-center transition-all group-hover:shadow-[0_0_15px_rgba(232,255,71,0.2)]">
      {num}
    </div>
    <div className="space-y-2">
      <h3 className="text-[1rem] font-syne font-bold">{title}</h3>
      <p className="text-[0.875rem] text-muted leading-relaxed font-light">{desc}</p>
    </div>
  </div>
);

export default App;
