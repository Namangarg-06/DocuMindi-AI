import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Sparkles } from 'lucide-react';
import SourceReferences from './SourceReferences';

export default function ChatMessage({ message }) {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-5`}>
      <div className={`flex max-w-[85%] sm:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2.5`}>
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs shadow-sm ${
            isUser
              ? 'bg-slate-900 text-white'
              : 'bg-gradient-to-tr from-brand-600 to-blue-400 text-white shadow-brand-500/20'
          }`}
        >
          {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
        </div>

        {/* Message Bubble */}
        <div className="flex flex-col">
          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
              isUser
                ? 'bg-brand-600 text-white rounded-tr-none'
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
            }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.text}</p>
            ) : (
              <div className="prose prose-slate prose-sm max-w-none">
                <ReactMarkdown>{message.text}</ReactMarkdown>
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
