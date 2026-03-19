import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, BarChart3, LineChart, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const ViralAnalytics = ({ clips }) => {
  const chartData = useMemo(() => {
    return clips.map((clip, idx) => ({
      name: `Clip ${idx + 1}`,
      score: clip.score,
      duration: Math.round(clip.end - clip.start),
      text: clip.text.slice(0, 20) + '...'
    }));
  }, [clips]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 p-4 rounded-2xl shadow-2xl border border-slate-800 text-white">
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-1">Viral Potential Score</p>
          <p className="text-2xl font-black text-blue-400 mb-2">{payload[0].value}</p>
          <p className="text-slate-100 text-xs italic font-medium">"{payload[0].payload.text}"</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 md:p-12 mt-12 overflow-hidden"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 mb-3">
             <TrendingUp size={12} /> Live AI Signal Analysis
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Viral Score Distribution</h2>
          <p className="text-slate-500 font-medium max-w-xl mt-2 leading-relaxed">
            Our ML model has analyzed the entire video. Use this distribution chart to identify the "peak" viral moments and prioritize your final selections.
          </p>
        </div>

        <div className="flex gap-4">
           <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center gap-4">
              <div className="bg-white w-10 h-10 rounded-2xl shadow-sm flex items-center justify-center border border-slate-100 text-blue-600">
                <BarChart3 size={20} />
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px]">Avg. Score</p>
                <p className="text-lg font-black text-slate-900">
                  {(clips.reduce((a, b) => a + b.score, 0) / clips.length).toFixed(2)}
                </p>
              </div>
           </div>
        </div>
      </div>

      <div className="h-[350px] w-full mb-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
              domain={[0, 10]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            <Bar dataKey="score" radius={[8, 8, 8, 8]} barSize={40}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.score > 7 ? '#2563eb' : entry.score > 5 ? '#3b82f6' : '#94a3b8'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex items-start gap-4">
            <div className="bg-blue-600 text-white w-8 h-8 rounded-xl flex items-center justify-center shrink-0">
               <Info size={18} />
            </div>
            <div>
               <h4 className="font-black text-blue-900 uppercase tracking-tight text-xs mb-1">Score > 7.5</h4>
               <p className="text-blue-700/80 text-xs font-medium leading-relaxed">Highest viral potential. Contains strong hooks, extreme motion, and emotional sentiment spikes.</p>
            </div>
         </div>
         <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-start gap-4">
            <div className="bg-slate-400 text-white w-8 h-8 rounded-xl flex items-center justify-center shrink-0">
               <TrendingUp size={18} />
            </div>
            <div>
               <h4 className="font-black text-slate-900 uppercase tracking-tight text-xs mb-1">Score 5.0 - 7.5</h4>
               <p className="text-slate-600 text-xs font-medium leading-relaxed">High-quality content. Good for secondary clips and building channel consistency.</p>
            </div>
         </div>
         <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-start gap-4 opacity-50">
            <div className="bg-slate-300 text-white w-8 h-8 rounded-xl flex items-center justify-center shrink-0">
               <LineChart size={18} />
            </div>
            <div>
               <h4 className="font-black text-slate-500 uppercase tracking-tight text-xs mb-1">Score Under 5</h4>
               <p className="text-slate-500 text-xs font-medium leading-relaxed">Low-energy segments. Typically context or filler that might not perform well as a standalone short.</p>
            </div>
         </div>
      </div>
    </motion.section>
  );
};

export default ViralAnalytics;
