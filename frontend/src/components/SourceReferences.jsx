import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, FileText } from 'lucide-react';

export default function SourceReferences({ sources }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 border-t border-white/10 pt-2.5">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors py-1 group focus:outline-none"
      >
        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
        <span>
          Retrieved Document Sources ({sources.length} {sources.length === 1 ? 'chunk' : 'chunks'})
        </span>
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-300 transition-transform" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-300 transition-transform" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-2.5 space-y-2.5 animate-fadeIn">
          {sources.map((src, index) => (
            <div
              key={index}
              className="bg-slate-800/70 border border-white/10 rounded-xl p-3 text-xs text-slate-200 transition-all hover:border-indigo-500/30 shadow-inner"
            >
              <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-white/5">
                <span className="inline-flex items-center space-x-1 font-semibold text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded-md text-[11px] border border-indigo-500/25">
                  <FileText className="w-3 h-3 mr-0.5" />
                  Page {src.page}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  FAISS Chunk #{index + 1}
                </span>
              </div>
              <p className="font-mono text-slate-300 text-[11px] leading-relaxed whitespace-pre-wrap bg-slate-900/60 p-2.5 rounded-lg border border-white/5">
                "{src.content}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
