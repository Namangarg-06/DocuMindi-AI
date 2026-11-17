import React from 'react';
import { FileText, RefreshCw, Sparkles, Clock, ShieldCheck, Zap } from 'lucide-react';

export default function Header({ 
  sessionData, 
  onResetSession, 
  isResetting, 
  onOpenHistory, 
  historyCount = 0 
}) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/75 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="relative group cursor-pointer">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 shadow-xs shadow-emerald-400" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-black tracking-tight text-white">
                DocuMindi <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">AI</span>
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                PRO RAG
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Next-Gen Local Document Intelligence</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* History Drawer Trigger */}
          <button
            onClick={onOpenHistory}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 rounded-xl shadow-xs transition-all hover:border-indigo-500/40"
            title="Browse your saved document history and past queries"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-gradient-to-r from-brand-500 to-indigo-500 text-white font-bold shadow-xs">
                {historyCount}
              </span>
            )}
          </button>

          {/* Active Document Info / Reset */}
          {sessionData ? (
            <div className="flex items-center space-x-2">
              <div className="hidden lg:flex items-center space-x-2 bg-slate-800/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300">
                <FileText className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                <span className="font-medium text-white max-w-[150px] truncate" title={sessionData.filename}>
                  {sessionData.filename}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{sessionData.total_pages} pgs</span>
              </div>

              <button
                onClick={onResetSession}
                disabled={isResetting}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-gradient-to-r from-rose-500/20 to-red-600/20 hover:from-rose-500/30 hover:to-red-600/30 border border-rose-500/30 rounded-xl shadow-xs transition-all disabled:opacity-50"
                title="Discard current session and upload another PDF"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-rose-400 ${isResetting ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">New PDF</span>
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Local CPU</span>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
