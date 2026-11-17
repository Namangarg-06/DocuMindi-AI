import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, AlertCircle, FileCheck2, HelpCircle } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { sendChatMessage } from '../services/api';

const SUGGESTED_QUESTIONS = [
  "Summarize this document.",
  "What are the main topics?",
  "Explain the key findings.",
  "What is the conclusion?",
];

export default function ChatWindow({ sessionData }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I have indexed **"${sessionData.filename}"** (${sessionData.total_pages} ${sessionData.total_pages === 1 ? 'page' : 'pages'}, ${sessionData.total_chunks} chunks).\n\nWhat would you like to know about this document? You can choose a suggested question below or type your own question.`,
      sources: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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

    // Append user message immediately
    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: userTimestamp,
    };

    setMessages((prev) => [...prev, userMessage]);
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

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || 'Failed to generate answer. Please try again.');
    } finally {
      setIsLoading(false);
      // Refocus input field
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 sm:px-6 py-4">
      {/* Document info banner */}
      <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 mb-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2 text-xs text-slate-600">
          <FileCheck2 className="w-4 h-4 text-emerald-600" />
          <span>Active PDF:</span>
          <span className="font-semibold text-slate-800">{sessionData.filename}</span>
          <span className="text-slate-300">|</span>
          <span>{sessionData.total_pages} {sessionData.total_pages === 1 ? 'page' : 'pages'}</span>
          <span className="text-slate-300">|</span>
          <span>{sessionData.total_chunks} indexed chunks</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-medium text-emerald-700">RAG Ready</span>
        </div>
      </div>

      {/* Chat Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-1 py-2 space-y-2">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex w-full justify-start mb-4">
            <div className="flex max-w-[80%] items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-blue-400 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"></div>
                  </div>
                  <span className="text-xs text-slate-500 ml-2">Searching FAISS & generating answer...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions (only displayed if only welcome message exists or user wants suggestions) */}
      {messages.length <= 2 && (
        <div className="mb-3">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-brand-500" />
            <span>Suggested Questions:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="text-xs bg-white hover:bg-brand-50 hover:border-brand-300 text-slate-700 hover:text-brand-700 px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2.5 text-red-800 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Query Failed: </span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Input Box */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-2 flex items-center gap-2">
        <textarea
          ref={inputRef}
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about the document... (Press Enter to send)"
          rows={1}
          disabled={isLoading}
          className="flex-1 resize-none bg-transparent px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none max-h-32 disabled:opacity-50"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputQuery.trim() || isLoading}
          className="w-10 h-10 rounded-xl bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-sm"
          title="Send Question"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      <p className="text-[11px] text-center text-slate-400 mt-2">
        Answers are strictly grounded in your uploaded PDF. Embeddings and document chunks exist only for this session.
      </p>
    </div>
  );
}
