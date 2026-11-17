import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Clock, 
  FileText, 
  MessageSquare, 
  Search, 
  ExternalLink,
  ChevronRight,
  Archive,
  AlertTriangle
} from 'lucide-react';
import { deleteHistoryItem, clearAllHistory } from '../services/historyService';

export default function HistoryDrawer({ 
  isOpen, 
  onClose, 
  historyList, 
  onSelectSession, 
  onHistoryUpdated,
  currentSessionId 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  if (!isOpen) return null;

  const filteredHistory = historyList.filter(item => {
    const q = searchQuery.toLowerCase();
    const nameMatches = (item.filename || '').toLowerCase().includes(q);
    const questionMatches = (item.messages || []).some(m => 
      (m.text || '').toLowerCase().includes(q)
    );
    return nameMatches || questionMatches;
  });

  const handleDeleteItem = (e, sessionId) => {
    e.stopPropagation();
    const updated = deleteHistoryItem(sessionId);
    onHistoryUpdated(updated);
  };

  const handleClearAll = () => {
    clearAllHistory();
    onHistoryUpdated([]);
    setConfirmClearAll(false);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Document History</h3>
                <p className="text-xs text-slate-500">
                  {historyList.length} saved {historyList.length === 1 ? 'document' : 'documents'}
                </p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3.5 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search past PDFs or questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Archive className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No History Found</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  {searchQuery 
                    ? "No documents match your search query." 
                    : "When you upload a PDF and chat, your past questions and answers will be saved here."}
                </p>
              </div>
            ) : (
              filteredHistory.map((item) => {
                const isSelected = item.session_id === currentSessionId;
                const lastUserMessage = (item.messages || [])
                  .filter(m => m.sender === 'user')
                  .slice(-1)[0];

                return (
                  <div
                    key={item.session_id}
                    onClick={() => {
                      onSelectSession(item);
                      onClose();
                    }}
                    className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-brand-50/70 border-brand-300 ring-1 ring-brand-400/30'
                        : 'bg-white hover:bg-slate-50 border-slate-200/90 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate" title={item.filename}>
                            {item.filename}
                          </p>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                            <span>{formatDate(item.timestamp || item.last_updated)}</span>
                            <span>•</span>
                            <span>{item.total_pages} {item.total_pages === 1 ? 'page' : 'pages'}</span>
                            <span>•</span>
                            <span className="flex items-center text-brand-600 font-medium">
                              <MessageSquare className="w-2.5 h-2.5 mr-0.5" />
                              {item.question_count || 0} Qs
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDeleteItem(e, item.session_id)}
                        className="p-1.5 rounded-md text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors opacity-80 group-hover:opacity-100"
                        title="Delete this history record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Last question snippet preview */}
                    {lastUserMessage && (
                      <div className="mt-2 text-[11px] text-slate-600 bg-slate-50/80 rounded-md p-1.5 border border-slate-100 truncate">
                        <span className="font-semibold text-slate-500">Q: </span>
                        "{lastUserMessage.text}"
                      </div>
                    )}

                    {isSelected && (
                      <div className="mt-2 flex items-center justify-end text-[10px] font-semibold text-brand-600">
                        <span>Currently Active Document</span>
                        <ChevronRight className="w-3 h-3 ml-0.5" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Clear All */}
          {historyList.length > 0 && (
            <div className="p-3.5 border-t border-slate-200 bg-slate-50">
              {confirmClearAll ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-red-700">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Clear all {historyList.length} history records?</span>
                  </div>
                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={handleClearAll}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1.5 rounded-lg transition-colors"
                    >
                      Yes, Clear All
                    </button>
                    <button
                      onClick={() => setConfirmClearAll(false)}
                      className="flex-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium py-1.5 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClearAll(true)}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50/50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Document History</span>
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
