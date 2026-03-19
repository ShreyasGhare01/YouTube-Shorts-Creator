import React, { useState, useEffect } from 'react';
import { Loader2, Timer, Clock, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProgressDisplay = ({ progress }) => {
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(null);

  useEffect(() => {
    if (progress && progress.percentage > 0 && !startTime) {
      setStartTime(Date.now());
    }
  }, [progress, startTime]);

  useEffect(() => {
    let timer;
    if (startTime && progress && progress.percentage < 100) {
      timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(elapsed);

        // Estimate remaining time
        if (progress.percentage > 5) {
          const totalEstimatedTime = (elapsed / progress.percentage) * 100;
          setEstimatedTimeRemaining(Math.max(0, Math.floor(totalEstimatedTime - elapsed)));
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [startTime, progress]);

  if (!progress) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isComplete = progress.percentage === 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 mt-12 overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 p-8">
        <div className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 border ${
          isComplete ? 'bg-green-50 text-green-600 border-green-200' : 'bg-blue-50 text-blue-600 border-blue-200'
        }`}>
          {isComplete ? (
             <><CheckCircle2 size={14} /> Pipeline Finished</>
          ) : (
             <><Loader2 size={14} className="animate-spin" /> Live ML Inference</>
          )}
        </div>
      </div>

      <div className="space-y-10">
        <div>
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-1">Current Process</p>
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-4">
                {progress.step}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-5xl md:text-6xl font-black text-blue-600 tracking-tighter leading-none">
                {progress.percentage}<span className="text-2xl text-blue-300">%</span>
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-8 mb-4 overflow-hidden p-1 border border-slate-200 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full bg-gradient-to-r ${
                isComplete ? 'from-green-500 to-emerald-600' : 'from-blue-600 to-indigo-700'
              } shadow-lg relative overflow-hidden`}
            >
               <div className="absolute inset-0 bg-white/20 animate-pulse" />
               <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:2rem_2rem] animate-[move_2s_linear_infinite]" />
            </motion.div>
          </div>

          <div className="flex items-center gap-2 text-slate-500 italic font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <Info size={18} className="text-blue-500 shrink-0" />
             "{progress.message}"
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-white w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center border border-slate-100 text-slate-600">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Elapsed Time</p>
                <p className="text-2xl font-black text-slate-900">{formatTime(elapsedTime)}</p>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {!isComplete && estimatedTimeRemaining !== null && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-blue-600 p-6 rounded-3xl border border-blue-500 flex items-center justify-between shadow-xl shadow-blue-500/20 text-white"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
                    <Timer size={24} />
                  </div>
                  <div>
                    <p className="text-blue-100 font-bold uppercase tracking-widest text-[10px]">Est. Remaining</p>
                    <p className="text-2xl font-black">{formatTime(estimatedTimeRemaining)}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-green-500/10 rounded-3xl border border-green-500/30 flex items-center gap-4 text-green-800"
          >
            <div className="bg-green-500 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="font-black text-lg">Shorts Generation Complete!</p>
              <p className="font-medium text-green-700/80">All vertical 9:16 videos have been exported to your target folder.</p>
            </div>
          </motion.div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes move {
          0% { background-position: 0 0; }
          100% { background-position: 2rem 0; }
        }
      `}} />
    </motion.div>
  );
};

export default ProgressDisplay;
