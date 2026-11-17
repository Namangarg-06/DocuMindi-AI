import React, { useState, useEffect } from 'react';
import { Sparkles, Cpu, ShieldCheck, Zap } from 'lucide-react';

export default function IntroSplash({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [phaseText, setPhaseText] = useState('Initializing Local RAG Architecture...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Stage 1: Initializing
    const t1 = setTimeout(() => {
      setProgress(35);
      setPhaseText('Loading Hugging Face all-MiniLM-L6-v2 Embeddings...');
    }, 400);

    // Stage 2: FAISS
    const t2 = setTimeout(() => {
      setProgress(75);
      setPhaseText('Mounting In-Memory FAISS Vector Index on CPU...');
    }, 1000);

    // Stage 3: Ready
    const t3 = setTimeout(() => {
      setProgress(100);
      setPhaseText('DocuMindi AI Neural Engine Ready.');
    }, 1600);

    // Stage 4: Trigger Fade Out
    const t4 = setTimeout(() => {
      setIsFadingOut(true);
    }, 2000);

    // Stage 5: Unmount
    const t5 = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(onFinish, 400);
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#070a13] flex flex-col items-center justify-center overflow-hidden transition-all duration-500 ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Ambient Cosmic Glowing Background */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-600/25 via-purple-600/20 to-blue-500/20 blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-cyan-500/15 blur-[90px] -bottom-20 -right-20 pointer-events-none" />

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 text-xs text-slate-400 hover:text-white px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-mono tracking-wider"
      >
        SKIP INTRO ➔
      </button>

      {/* Center Cinematic Container */}
      <div className="relative flex flex-col items-center z-10 px-6 text-center max-w-lg">
        
        {/* Holographic Glowing Icon */}
        <div className="relative mb-8 group">
          {/* Rotating halo rings */}
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-60 blur-xl animate-spin duration-3000 pointer-events-none" />
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 opacity-90 blur-sm pointer-events-none" />
          
          <div className="relative w-24 h-24 rounded-3xl bg-slate-900/90 border border-white/20 flex items-center justify-center text-white shadow-2xl backdrop-blur-xl">
            <Sparkles className="w-12 h-12 text-indigo-400 animate-pulse" />
          </div>
        </div>

        {/* Brand Name Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-mono tracking-widest uppercase">
            <span>● NEURAL RETRIEVAL ENGINE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            DocuMindi{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              AI
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-sm mx-auto">
            Grounded Document Intelligence & Local Vector Search
          </p>
        </div>

        {/* High-Tech Progress Bar */}
        <div className="mt-8 w-64 sm:w-80">
          <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 rounded-full transition-all duration-500 shadow-md shadow-indigo-500/50"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-2.5">
            <span className="truncate max-w-[200px]">{phaseText}</span>
            <span className="text-indigo-400 font-bold">{progress}%</span>
          </div>
        </div>

        {/* Micro-features strip */}
        <div className="mt-8 flex items-center space-x-4 text-[10px] text-slate-500 font-mono">
          <span className="flex items-center space-x-1">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>100% CPU</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>In-Memory FAISS</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Groq LLM</span>
          </span>
        </div>

      </div>
    </div>
  );
}
