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
      <div className={`flex max-w-[88%] sm:max-w-[78%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2.5 sm:gap-3`}>
        
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs shadow-sm ${
            isUser
              ? 'bg-slate-900 text-white'
              : 'bg-gradient-to-tr from-brand-600 via-indigo-600 to-blue-400 text-white shadow-brand-500/20'
          }`}
        >
          {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
        </div>

        {/* Message Bubble */}
        <div className="flex flex-col min-w-0">
          <div
            className={`relative rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm transition-all ${
              isUser
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-tr-none'
                : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none shadow-xs'
            }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.text}</p>
            ) : (
              <div className="prose prose-slate prose-sm max-w-none">
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>
            )}

            {/* Copy button for Assistant */}
            {!isUser && (
              <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center space-x-1 hover:text-slate-700 transition-colors py-0.5 px-1.5 rounded hover:bg-slate-100"
                  title="Copy answer text"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <span>DocuMindi AI Grounded</span>
              </div>
            )}

            {/* Source citations for assistant responses */}
            {!isUser && message.sources && message.sources.length > 0 && (
              <SourceReferences sources={message.sources} />
            )}
          </div>

          {/* Timestamp */}
          <span
            className={`text-[10px] text-slate-400 mt-1 px-1 ${
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
