import React from 'react';
import { FileText, RefreshCw, Sparkles, Clock, ShieldCheck } from 'lucide-react';

export default function Header({ 
  sessionData, 
  onResetSession, 
  isResetting, 
  onOpenHistory, 
  historyCount = 0 
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-blue-400 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
                DocuMindi <span className="text-brand-600">AI</span>
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                RAG 2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Intelligent Local Document Chat</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-brand-600 bg-white hover:bg-brand-50/60 border border-slate-200 rounded-lg shadow-2xs transition-all"
            title="View past document queries and history"
          >
            <Clock className="w-3.5 h-3.5 text-brand-600" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-brand-100 text-brand-700 font-bold">
                {historyCount}
              </span>
            )}
          </button>

          {/* Active Document Info / Reset */}
          {sessionData ? (
            <div className="flex items-center space-x-2">
              <div className="hidden lg:flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600">
                <FileText className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                <span className="font-medium text-slate-800 max-w-[140px] truncate" title={sessionData.filename}>
                  {sessionData.filename}
                </span>
                <span className="text-slate-300">•</span>
                <span>{sessionData.total_pages} pgs</span>
              </div>

              <button
                onClick={onResetSession}
                disabled={isResetting}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
                title="Discard session and upload another PDF"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">New PDF</span>
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Local CPU</span>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
