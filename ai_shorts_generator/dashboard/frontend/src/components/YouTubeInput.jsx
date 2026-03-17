import React from 'react';
import { Search, Link as LinkIcon } from 'lucide-react';

const YouTubeInput = ({ url, setUrl, onFetchInfo, isLoading, disabled }) => {
  return (
    <div className={`bg-white p-8 rounded-2xl shadow-xl border border-slate-100 transition-all ${disabled ? 'opacity-60 grayscale' : ''}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <LinkIcon className="text-blue-600" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">1. YouTube Video Link</h2>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={disabled || isLoading}
            placeholder="Paste YouTube URL here..."
            className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg font-medium placeholder:text-slate-400 disabled:cursor-not-allowed"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        </div>
        <button
          onClick={onFetchInfo}
          disabled={disabled || isLoading || !url}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:shadow-none min-w-[180px]"
        >
          {isLoading ? (
            <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : 'Load Video'}
        </button>
      </div>
    </div>
  );
};

export default YouTubeInput;
