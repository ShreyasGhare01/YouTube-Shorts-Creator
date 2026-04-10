import React from 'react';
import { HelpCircle, Download, Zap, Edit3, Youtube, CheckCircle2, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const HelpSection = () => {
  const steps = [
    {
      title: "Input & Analyze",
      description: "Paste a YouTube URL. Our system downloads the video and audio, then runs multiple AI models to transcribe speech and detect high-energy moments.",
      icon: <Download className="text-blue-500" size={24} />,
      ml_details: "Uses yt-dlp for extraction and Faster-Whisper for high-accuracy transcription."
    },
    {
      title: "Viral Detection",
      description: "The AI Viral Moment Scorer analyzes audio intensity, visual motion, transcript sentiment, and virality potential based on trending patterns.",
      icon: <Zap className="text-yellow-500" size={24} />,
      ml_details: "Viral Score = 0.25*Emotion + 0.25*Virality + 0.15*Keywords + 0.15*Motion + 0.20*Context."
    },
    {
      title: "Smart Editing",
      description: "The pipeline performs smart face-tracking crops, generates viral hook captions, and synchronizes cuts to the background music's beat.",
      icon: <Edit3 className="text-purple-500" size={24} />,
      ml_details: "Uses OpenCV Haar Cascades for face tracking and Librosa for dynamic beat synchronization."
    },
    {
      title: "Final Export",
      description: "Metadata, thumbnails, and multiple A/B testing variants are generated. Final shorts are rendered in 9:16 vertical format ready for upload.",
      icon: <CheckCircle2 className="text-green-500" size={24} />,
      ml_details: "Uses MoviePy for composition and generates A/B testing variants via GPT-2 logic."
    }
  ];

  return (
    <section id="help" className="glass-card rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 md:p-12 text-white">
        <div className="flex items-center gap-4 mb-4">
          <HelpCircle size={32} className="text-blue-100" />
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">How ShortsAI Works</h2>
        </div>
        <p className="text-blue-100 text-lg md:text-xl font-medium max-w-3xl leading-relaxed">
          ShortsAI is a state-of-the-art automated pipeline that converts long-form content into viral, high-quality YouTube Shorts using 15+ specialized AI/ML modules.
        </p>
      </div>

      <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
            className="flex flex-col gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
          >
            <div className="glass-card w-14 h-14 rounded-2xl shadow-sm flex items-center justify-center border border-white/5">
              {step.icon}
            </div>
            <div>
              <h3 className="text-xl font-black text-text font-syne mb-2">{idx + 1}. {step.title}</h3>
              <p className="text-muted text-sm leading-relaxed mb-4">{step.description}</p>

              <div className="bg-blue-100/50 p-3 rounded-xl border border-blue-200/50">
                <div className="flex items-center gap-1.5 text-blue-800 text-[10px] font-black uppercase tracking-widest mb-1">
                  <Info size={12} /> ML Process
                </div>
                <p className="text-blue-700 text-xs font-medium">{step.ml_details}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-900 p-8 text-center border-t border-slate-800">
        <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
           <span className="text-white font-black tracking-widest text-sm flex items-center gap-2">
             <Youtube size={18} /> YOUTUBE OPTIMIZED
           </span>
           <span className="text-white font-black tracking-widest text-sm uppercase">Smart-Cropping 9:16</span>
           <span className="text-white font-black tracking-widest text-sm uppercase">AI Hook Generator</span>
           <span className="text-white font-black tracking-widest text-sm uppercase">Beat Syncing</span>
        </div>
      </div>
    </section>
  );
};

export default HelpSection;
