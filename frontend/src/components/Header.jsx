import React from 'react';
import { FileText, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';

export default function Header({ sessionData, onResetSession, isResetting }) {
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-blue-400 flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">DocuMindi</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                RAG AI
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Chat with your PDF document locally</p>
          </div>
        </div>

        {/* Right Action / Active Document Metadata */}
        <div className="flex items-center space-x-3">
          {sessionData ? (
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600">
                <FileText className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                <span className="font-medium text-slate-800 max-w-[160px] truncate" title={sessionData.filename}>
                  {sessionData.filename}
                </span>
                <span className="text-slate-300">•</span>
                <span>{sessionData.total_pages} {sessionData.total_pages === 1 ? 'page' : 'pages'}</span>
                <span className="text-slate-300">•</span>
                <span>{sessionData.total_chunks} chunks</span>
              </div>

              <button
                onClick={onResetSession}
                disabled={isResetting}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                title="Discard session and upload another PDF"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                <span>Upload Another PDF</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Temporary Session (No Data Saved)</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
