import React from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

const VideoVerification = ({ videoInfo, onConfirm, onClear }) => {
  if (!videoInfo) return null;

  return (
    <div className="bg-white p-8 rounded-2xl shadow-2xl border-4 border-blue-100 animate-in fade-in slide-in-from-top-6 duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Info size={120} />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-600 rounded-lg">
          <CheckCircle className="text-white" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">2. Video Verification</h2>
      </div>

      <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 mb-8 relative z-10">
        <p className="text-xs text-blue-500 font-black uppercase tracking-[0.2em] mb-2">Metadata Captured</p>
        <h3 className="text-2xl font-black text-slate-900 leading-tight mb-4">{videoInfo.title}</h3>
        <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-500">
          <span className="bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">👤 {videoInfo.channel}</span>
          <span className="bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">🕒 {Math.floor(videoInfo.duration / 60)}m {videoInfo.duration % 60}s</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 relative z-10">
        <button
          onClick={onConfirm}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-100 hover:shadow-2xl hover:-translate-y-1 active:translate-y-0"
        >
          <CheckCircle size={24} /> Yes, proceed
        </button>
        <button
          onClick={onClear}
          className="bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 border-2 border-slate-100 hover:border-red-100 py-5 px-8 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
        >
          <XCircle size={20} /> Reset
        </button>
      </div>
    </div>
  );
};

export default VideoVerification;
