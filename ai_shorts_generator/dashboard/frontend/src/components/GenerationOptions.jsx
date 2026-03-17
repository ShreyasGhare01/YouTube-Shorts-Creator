import React from 'react';
import { Folder, Hash, Settings } from 'lucide-react';

const GenerationOptions = ({ shortCount, setShortCount, exportPath, setExportPath, disabled }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Hash className="text-indigo-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">3. Generation Count</h2>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Number of Shorts to Find</label>
          <div className="relative group">
            <select
              value={shortCount}
              onChange={(e) => setShortCount(parseInt(e.target.value))}
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none appearance-none font-bold text-lg text-slate-700 transition-all cursor-pointer"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i+1} value={i+1}>{i+1} Best Moments</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
              ▼
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 font-medium italic">Our AI will rank clips and select the top {shortCount} based on your choice.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Folder className="text-emerald-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">4. Export Location</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Destination Folder</label>
            <input
              type="text"
              value={exportPath}
              onChange={(e) => setExportPath(e.target.value)}
              placeholder="e.g. C:\Users\Media\Exports"
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all font-mono text-sm"
            />
          </div>

          <div className="flex items-center gap-2 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs text-emerald-700 font-bold uppercase tracking-tight">Ready for export</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerationOptions;
