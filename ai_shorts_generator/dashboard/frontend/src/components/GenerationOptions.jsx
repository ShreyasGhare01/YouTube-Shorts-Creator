import React from 'react';
import { Folder, Hash } from 'lucide-react';

const GenerationOptions = ({ shortCount, setShortCount, exportPath, setExportPath, disabled }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <Hash size={24} className="text-blue-500" /> 3. Generation Options
        </h2>
        <label className="block text-sm font-medium text-gray-600 mb-2">Number of Shorts</label>
        <select
          value={shortCount}
          onChange={(e) => setShortCount(parseInt(e.target.value))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-gray-50"
        >
          {[...Array(10)].map((_, i) => (
            <option key={i+1} value={i+1}>{i+1} Shorts</option>
          ))}
        </select>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <Folder size={24} className="text-blue-500" /> 4. Export Location
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            value={exportPath}
            onChange={(e) => setExportPath(e.target.value)}
            placeholder="Enter export path (e.g. /app/exports)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="text-xs text-gray-500 italic">Enter the absolute path where you want to save the shorts.</p>
        </div>
      </div>
    </div>
  );
};

export default GenerationOptions;
