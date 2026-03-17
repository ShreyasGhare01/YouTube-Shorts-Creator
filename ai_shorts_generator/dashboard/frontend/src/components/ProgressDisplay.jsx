import React from 'react';
import { Loader2 } from 'lucide-react';

const ProgressDisplay = ({ progress }) => {
  if (!progress) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-500 mt-8 animate-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          {progress.percentage < 100 ? (
            <Loader2 className="animate-spin text-blue-500" size={24} />
          ) : (
            <span className="text-green-500">✓</span>
          )}
          {progress.step}
        </h3>
        <span className="text-2xl font-black text-blue-600">{progress.percentage}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-700 ease-out"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      <p className="text-gray-600 italic">{progress.message}</p>

      {progress.percentage === 100 && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-green-800 font-bold">All shorts successfully generated and exported!</p>
        </div>
      )}
    </div>
  );
};

export default ProgressDisplay;
