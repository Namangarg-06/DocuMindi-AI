import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  FileCheck2, 
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import ChatMessage from './ChatMessage';
import { sendChatMessage } from '../services/api';
import { saveSessionToHistory } from '../services/historyService';

const SUGGESTED_QUESTIONS = [
  "Summarize this document.",
  "What are the main topics?",
  "Explain the key findings.",
  "What is the conclusion?",
];

export default function ChatWindow({ sessionData, initialMessages = null, onHistoryUpdated }) {
  const [messages, setMessages] = useState(() => {
    if (initialMessages && initialMessages.length > 0) {
      return initialMessages;
    }
    return [
      {
        id: 'welcome',
        sender: 'assistant',
        text: `Hello! I have indexed **"${sessionData.filename}"** (${sessionData.total_pages} ${sessionData.total_pages === 1 ? 'page' : 'pages'}, ${sessionData.total_chunks} chunks).\n\nWhat would you like to know about this document? You can choose a suggested question below or type your own question.`,
        sources: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0) {
      saveSessionToHistory(sessionData, messages);
      if (onHistoryUpdated) {
        onHistoryUpdated();
      }
    }
  }, [messages, sessionData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    setErrorMessage('');
    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: userTimestamp,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(sessionData.session_id, query);

      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        sources: response.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages([...newMessages, aiMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || 'Failed to generate answer. Please try again.');
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    const resetWelcome = [
      {
        id: 'welcome',
        sender: 'assistant',
        text: `Chat cleared for **"${sessionData.filename}"**. Ask a new question whenever you're ready!`,
        sources: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setMessages(resetWelcome);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 sm:px-6 py-4 z-10 relative">
      
      {/* Top Document Status Banner */}
      <div className="glass-panel rounded-2xl px-4 py-2.5 mb-3 flex items-center justify-between border border-white/10 shadow-lg">
        <div className="flex items-center space-x-2.5 text-xs text-slate-300 truncate">
          <FileCheck2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-slate-400">PDF:</span>
          <span className="font-bold text-white truncate max-w-[200px]" title={sessionData.filename}>
            {sessionData.filename}
          </span>
          <span className="text-slate-600">•</span>
          <span className="hidden sm:inline">{sessionData.total_pages} pages</span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="hidden sm:inline text-indigo-300 font-mono">{sessionData.total_chunks} chunks</span>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={handleClearChat}
            className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
            title="Clear current messages"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>

          <div className="flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-emerald-500/20 shadow-xs shadow-emerald-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Indexed</span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-1 py-2 space-y-2">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex w-full justify-start mb-4">
            <div className="flex max-w-[85%] items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="glass-panel border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 shadow-xl">
                <div className="flex items-center space-x-2.5">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></div>
                  </div>
                  <span className="text-xs text-slate-300 font-medium">
                    Retrieving FAISS context & generating grounded answer...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 2 && (
        <div className="mb-3">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-medium text-slate-300">Suggested Questions:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="text-xs bg-slate-800/80 hover:bg-indigo-600/20 text-slate-300 hover:text-white hover:border-indigo-500/50 px-3.5 py-1.5 rounded-xl border border-white/10 shadow-xs transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-3 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start space-x-2.5 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Error: </span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="glass-panel border border-white/15 rounded-2xl p-2 flex items-center gap-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20 shadow-xl transition-all">
        <textarea
          ref={inputRef}
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about the document... (Press Enter to send)"
          rows={1}
          disabled={isLoading}
          className="flex-1 resize-none bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none max-h-32 disabled:opacity-50"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputQuery.trim() || isLoading}
          className="w-10 h-10 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-lg shadow-indigo-500/30"
          title="Send Question"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      <p className="text-[10px] text-center text-slate-500 mt-2">
        DocuMindi AI answers are strictly grounded in your document with automatic session history.
      </p>

    </div>
  );
}
