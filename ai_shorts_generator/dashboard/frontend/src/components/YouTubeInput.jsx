import React from 'react';
import { Search, Link as LinkIcon, Play } from 'lucide-react';

const YouTubeInput = ({ url, setUrl, onFetchInfo, isLoading, disabled }) => {
  return (
    <div className={`glass-card p-2 pr-2 pl-6 flex flex-col sm:flex-row items-center gap-4 transition-all ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-center gap-3 flex-1 w-full">
        <LinkIcon className="text-muted flex-shrink-0" size={18} />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={disabled || isLoading}
          placeholder="Paste YouTube URL here…"
          className="w-full py-4 bg-transparent outline-none text-sm font-medium text-text placeholder:text-muted caret-accent"
        />
      </div>
      <button
        onClick={onFetchInfo}
        disabled={disabled || isLoading || !url}
        className="load-btn w-full sm:w-auto"
      >
        {isLoading ? (
          <div className="h-4 w-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
        ) : (
          <>
            <Play size={16} fill="currentColor" />
            Load Video
          </>
        )}
      </button>
    </div>
  );
};

export default YouTubeInput;
