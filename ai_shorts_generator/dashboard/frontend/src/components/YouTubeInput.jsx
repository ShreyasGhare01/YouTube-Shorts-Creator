import React from 'react';
import { Play, Link as LinkIcon } from 'lucide-react';

const YouTubeInput = ({ url, setUrl, onFetchInfo, isLoading, disabled }) => {
  return (
    <div className={`url-card flex flex-col sm:flex-row items-center gap-[10px] transition-all ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-center gap-3 flex-1 w-full pl-5 py-2">
        <LinkIcon className="text-muted flex-shrink-0" size={18} />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={disabled || isLoading}
          placeholder="Paste YouTube URL here…"
          className="w-full bg-transparent outline-none text-[0.95rem] font-medium text-text placeholder:text-muted caret-accent py-[14px]"
        />
      </div>
      <button
        onClick={onFetchInfo}
        disabled={disabled || isLoading || !url}
        className="load-btn h-[46px] m-1.5"
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
