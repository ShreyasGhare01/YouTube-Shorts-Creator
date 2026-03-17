import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const VideoVerification = ({ videoInfo, onConfirm, onClear }) => {
  if (!videoInfo) return null;

  return (
    <div className="bg-blue-50 p-6 rounded-xl shadow-inner border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
      <h2 className="text-xl font-semibold mb-4 text-blue-900">2. Video Verification</h2>
      <div className="bg-white p-4 rounded-lg border border-blue-200 mb-6">
        <p className="text-sm text-blue-600 font-medium uppercase tracking-wider mb-1">Detected Video Title</p>
        <p className="text-lg font-bold text-gray-900">{videoInfo.title}</p>
        <p className="text-sm text-gray-500 mt-2">{videoInfo.channel} • {Math.floor(videoInfo.duration / 60)}m {videoInfo.duration % 60}s</p>
      </div>

      <p className="text-gray-700 mb-4">Is this correct?</p>
      <div className="flex gap-4">
        <button
          onClick={onConfirm}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <CheckCircle size={20} /> Confirm
        </button>
        <button
          onClick={onClear}
          className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <XCircle size={20} /> Clear
        </button>
      </div>
    </div>
  );
};

export default VideoVerification;
