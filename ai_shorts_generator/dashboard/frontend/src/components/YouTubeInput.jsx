import React from 'react';
import { Search } from 'lucide-react';

const YouTubeInput = ({ url, setUrl, onFetchInfo, isLoading }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">1. YouTube Video Link</h2>
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        <button
          onClick={onFetchInfo}
          disabled={isLoading || !url}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {isLoading ? 'Fetching...' : <><Search size={20} /> Get Info</>}
        </button>
      </div>
    </div>
  );
};

export default YouTubeInput;
