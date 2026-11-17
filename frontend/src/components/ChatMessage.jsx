import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Sparkles, Copy, Check } from 'lucide-react';
import SourceReferences from './SourceReferences';

export default function ChatMessage({ message }) {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!message.text) return;
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-5 group`}>
      <div className={`flex max-w-[90%] sm:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs shadow-md ${
            isUser
              ? 'bg-slate-800 text-slate-200 border border-white/10'
              : 'bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-500 text-white shadow-indigo-500/30'
          }`}
        >
          {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
        </div>

        {/* Message Bubble Container */}
        <div className="flex flex-col min-w-0">
          <div
            className={`relative rounded-2xl px-4 sm:px-5 py-3.5 text-xs sm:text-sm leading-relaxed transition-all ${
              isUser
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/25'
                : 'glass-panel text-slate-100 rounded-tl-none border border-white/10 shadow-xl shadow-black/40'
            }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.text}</p>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>
            )}

            {/* Prominent Copy Button & Watermark for Assistant */}
            {!isUser && (
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-[11px] text-slate-400">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-white/10 transition-all hover:border-indigo-400/40"
                  title="Copy answer to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Answer</span>
                    </>
                  )}
                </button>
                
                <span className="text-[10px] text-slate-500 font-mono">
                  DocuMindi Grounded Answer
                </span>
              </div>
            )}

            {/* Source citations for assistant responses */}
            {!isUser && message.sources && message.sources.length > 0 && (
              <SourceReferences sources={message.sources} />
            )}
          </div>

          {/* Timestamp */}
          <span
            className={`text-[10px] text-slate-500 mt-1 px-1 font-mono ${
              isUser ? 'text-right' : 'text-left'
            }`}
          >
            {message.timestamp || ''}
          </span>
        </div>

      </div>
    </div>
  );
}
