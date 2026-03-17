import React from 'react';
import ClipCard from './ClipCard';
import { CheckSquare, Square, AlertTriangle } from 'lucide-react';

const ClipGrid = ({ clips, approvedClipIds, onToggleApproval, onSelectAll, onDeselectAll, targetShortCount }) => {
  const approvedCount = approvedClipIds.length;
  const isOverLimit = approvedCount > targetShortCount;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 space-y-6 mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clip Preview Mode</h2>
          <p className="text-gray-500">Review the top viral moments detected by AI</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSelectAll}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
          >
            <CheckSquare size={18} /> Select All
          </button>
          <button
            onClick={onDeselectAll}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
          >
            <Square size={18} /> Deselect All
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black">
            {approvedCount}
          </div>
          <span className="font-bold text-blue-900 uppercase tracking-tight">Clips Approved</span>
        </div>

        {isOverLimit && (
          <div className="flex items-center gap-2 text-amber-600 font-medium text-sm bg-amber-50 px-4 py-2 rounded-lg border border-amber-200 animate-pulse">
            <AlertTriangle size={18} />
            You selected {approvedCount} clips but only {targetShortCount} shorts will be generated.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {clips.map(clip => (
          <ClipCard
            key={clip.id}
            clip={clip}
            isApproved={approvedClipIds.includes(clip.id)}
            onToggle={onToggleApproval}
          />
        ))}
      </div>

      {clips.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-medium">No strong highlights detected. Try another video.</p>
        </div>
      )}
    </div>
  );
};

export default ClipGrid;
