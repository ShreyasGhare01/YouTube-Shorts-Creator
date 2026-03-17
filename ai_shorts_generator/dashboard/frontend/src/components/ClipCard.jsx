import React from 'react';
import { Check, X, Clock, Zap } from 'lucide-react';

const ClipCard = ({ clip, isApproved, onToggle }) => {
  return (
    <div className={`relative bg-white rounded-xl overflow-hidden shadow-md border-2 transition-all duration-300 ${
      isApproved ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 opacity-60 grayscale'
    }`}>
      <div className="aspect-video bg-black relative">
        <video
          src={clip.file_path}
          className="w-full h-full object-contain"
          controls
          muted
        />
        <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
          <Zap size={14} className="text-yellow-400" /> {clip.score}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
          <span className="flex items-center gap-1"><Clock size={12}/> {Math.floor(clip.start)}s - {Math.floor(clip.end)}s</span>
          <span>{Math.round(clip.end - clip.start)}s duration</span>
        </div>

        <p className="text-sm text-gray-700 line-clamp-2 italic">
          "{clip.transcript}"
        </p>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onToggle(clip.id, true)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1 transition-colors ${
              isApproved ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-green-100'
            }`}
          >
            <Check size={16} /> Approve
          </button>
          <button
            onClick={() => onToggle(clip.id, false)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1 transition-colors ${
              !isApproved ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-red-100'
            }`}
          >
            <X size={16} /> Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClipCard;
