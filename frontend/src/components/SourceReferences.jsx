import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, FileText } from 'lucide-react';

export default function SourceReferences({ sources }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 border-t border-slate-100 pt-2.5">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors py-1 group focus:outline-none"
      >
        <BookOpen className="w-3.5 h-3.5 text-brand-500" />
        <span>
          Retrieved Document Sources ({sources.length} {sources.length === 1 ? 'chunk' : 'chunks'})
        </span>
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 transition-transform" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 transition-transform" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-2.5 space-y-2.5 animate-fadeIn">
          {sources.map((src, index) => (
            <div
              key={index}
              className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 transition-all hover:border-slate-300"
            >
              <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-200/60">
                <span className="inline-flex items-center space-x-1 font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded text-[11px] border border-brand-100">
                  <FileText className="w-3 h-3 mr-0.5" />
                  Page {src.page}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Chunk #{index + 1}
                </span>
              </div>
              <p className="font-mono text-slate-600 text-[11px] leading-relaxed whitespace-pre-wrap bg-white/60 p-2 rounded border border-slate-100">
                "{src.content}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
