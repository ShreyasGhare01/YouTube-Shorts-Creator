import React from 'react';
import { Palette, Music, SkipForward, Type, Clock, Sliders, Zap } from 'lucide-react';

const CreativeControls = ({ settings, setSettings, onApplyPreset }) => {
  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const presets = [
    { name: 'Viral TikTok', mood: 'high_energy', music_style: 'upbeat', caption_style: 'viral', editing_intensity: 5 },
    { name: 'Podcast Clip', mood: 'serious', music_style: 'lo-fi', caption_style: 'clean', editing_intensity: 2 },
    { name: 'Motivational', mood: 'motivational', music_style: 'inspirational', caption_style: 'viral', editing_intensity: 3 },
    { name: 'Funny Meme', mood: 'funny', music_style: 'upbeat', caption_style: 'viral', editing_intensity: 5 },
  ];

  return (
    <div className="glass-card p-8 rounded-[2rem] shadow-2xl border border-slate-100 space-y-10">
      <div className="flex items-center justify-between border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 text-white">
            <Palette size={28} />
          </div>
          <h2 className="text-3xl font-black text-text font-syne tracking-tight">Creative Controls</h2>
        </div>
        <div className="flex gap-2">
          {presets.map(p => (
            <button
              key={p.name}
              onClick={() => onApplyPreset(p)}
              className="px-4 py-2 bg-surface2 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest border border-white/5 hover:border-indigo-200 transition-all active:scale-95"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest">
            <Zap size={16} className="text-amber-500" /> Video Mood
          </label>
          <select
            value={settings.mood}
            onChange={(e) => handleChange('mood', e.target.value)}
            className="w-full p-4 bg-surface2 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all cursor-pointer"
          >
            <option value="funny">Funny / Comedy</option>
            <option value="serious">Serious / Informational</option>
            <option value="motivational">Motivational</option>
            <option value="high_energy">High Energy / Hype</option>
            <option value="calm">Calm / Relaxing</option>
          </select>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest">
            <Music size={16} className="text-purple-500" /> Music Style
          </label>
          <select
            value={settings.music_style}
            onChange={(e) => handleChange('music_style', e.target.value)}
            className="w-full p-4 bg-surface2 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all cursor-pointer"
          >
            <option value="auto">Auto (AI decides)</option>
            <option value="none">None</option>
            <option value="upbeat">Upbeat</option>
            <option value="lo-fi">Lo-fi</option>
            <option value="inspirational">Inspirational</option>
            <option value="cinematic">Cinematic</option>
          </select>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest">
            <SkipForward size={16} className="text-emerald-500" /> Ending
          </label>
          <select
            value={settings.ending_style}
            onChange={(e) => handleChange('ending_style', e.target.value)}
            className="w-full p-4 bg-surface2 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all cursor-pointer"
          >
            <option value="hard_cut">Hard Cut</option>
            <option value="fade_out">Fade Out</option>
            <option value="zoom_fade">Zoom Fade</option>
            <option value="loop">Loop Ending</option>
          </select>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest">
            <Type size={16} className="text-blue-500" /> Captions
          </label>
          <select
            value={settings.caption_style}
            onChange={(e) => handleChange('caption_style', e.target.value)}
            className="w-full p-4 bg-surface2 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all cursor-pointer"
          >
            <option value="viral">Bold Viral</option>
            <option value="clean">Clean Minimal</option>
            <option value="karaoke">Karaoke</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest">
              <Clock size={16} className="text-rose-500" /> Clip Length Bias
            </label>
            <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-xs font-black">{settings.clip_length_preference}s</span>
          </div>
          <input
            type="range"
            min="15"
            max="60"
            value={settings.clip_length_preference}
            onChange={(e) => handleChange('clip_length_preference', parseInt(e.target.value))}
            className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest">
              <Sliders size={16} className="text-blue-500" /> Editing Intensity
            </label>
            <span className="bg-blue-50 text-accent px-3 py-1 rounded-full text-xs font-black">Level {settings.editing_intensity}</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={settings.editing_intensity}
            onChange={(e) => handleChange('editing_intensity', parseInt(e.target.value))}
            className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-600/20 blur-[100px] pointer-events-none" />
        <div className="relative z-10">
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Configuration Summary</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <p className="text-white font-bold"><span className="text-muted font-medium">Mood:</span> {settings.mood.replace('_', ' ')}</p>
            <p className="text-white font-bold"><span className="text-muted font-medium">Music:</span> {settings.music_style}</p>
            <p className="text-white font-bold"><span className="text-muted font-medium">Style:</span> {settings.caption_style}</p>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-3 glass-card/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
          <div className="text-right hidden sm:block">
            <p className="text-white font-black text-sm uppercase tracking-tighter leading-none mb-1">Human-in-the-Loop</p>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Creative override active</p>
          </div>
          <div className="bg-green-500 p-2 rounded-lg shadow-lg shadow-green-500/20">
            <Zap size={20} className="text-white" fill="white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreativeControls;
