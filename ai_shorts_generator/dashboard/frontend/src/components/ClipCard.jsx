import React from 'react';
import { Check, X, Clock, Zap, ExternalLink } from 'lucide-react';

const ClipCard = ({ clip, isApproved, onToggle }) => {
  return (
    <div className={`group relative glass-card rounded-2xl overflow-hidden  border-2 transition-all duration-500 ${
      isApproved ? 'border-green-500 ring-4 ring-green-50' : 'border-white/5 opacity-50 grayscale'
    }`}>
      <div className="aspect-video bg-slate-900 relative overflow-hidden">
        <video
          src={clip.file_path}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
          controls
          muted
        />
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-sm font-black flex items-center gap-2 border border-white/20">
          <Zap size={16} className="text-yellow-400 fill-yellow-400" /> {clip.score}
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-widest">
          <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
            <Clock size={14} className="text-blue-500"/> {Math.floor(clip.start)}s - {Math.floor(clip.end)}s
          </span>
          <span className="bg-blue-50 text-accent px-2 py-1 rounded-md">
            {Math.round(clip.end - clip.start)}s clip
          </span>
        </div>

        <div className="relative min-h-[4rem]">
          <p className="text-slate-600 font-medium leading-relaxed italic line-clamp-3 pl-4 border-l-4 border-slate-200">
            "{clip.text}"
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onToggle(clip.id, true)}
            className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${
              isApproved
                ? 'bg-green-600 text-white  shadow-green-200'
                : 'bg-slate-100 text-muted hover:bg-green-50 hover:text-green-600'
            }`}
          >
            <Check size={18} strokeWidth={3} /> Approve
          </button>
          <button
            onClick={() => onToggle(clip.id, false)}
            className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${
              !isApproved
                ? 'bg-red-500 text-white  shadow-red-200'
                : 'bg-slate-100 text-muted hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <X size={18} strokeWidth={3} /> Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClipCard;
