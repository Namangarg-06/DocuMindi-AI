import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import ChatWindow from './components/ChatWindow';
import HistoryDrawer from './components/HistoryDrawer';
import { deleteSession } from './services/api';
import { getHistory } from './services/historyService';

export default function App() {
  const [sessionData, setSessionData] = useState(null);
  const [initialMessages, setInitialMessages] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  // Refresh history list on mount and updates
  const refreshHistory = () => {
    setHistoryList(getHistory());
  };

  useEffect(() => {
    refreshHistory();
  }, []);

  const handleUploadSuccess = (data) => {
    setInitialMessages(null);
    setSessionData({
      session_id: data.session_id,
      filename: data.filename,
      total_pages: data.total_pages,
      total_chunks: data.total_chunks,
    });
    refreshHistory();
  };

  const handleSelectHistorySession = (historyItem) => {
    setSessionData({
      session_id: historyItem.session_id,
      filename: historyItem.filename,
      total_pages: historyItem.total_pages,
      total_chunks: historyItem.total_chunks,
    });
    setInitialMessages(historyItem.messages || null);
  };

  const handleResetSession = async () => {
    if (!sessionData) return;

    setIsResetting(true);
    try {
      await deleteSession(sessionData.session_id);
    } catch (e) {
      console.warn('Reset warning:', e);
    } finally {
      setSessionData(null);
      setInitialMessages(null);
      setIsResetting(false);
      refreshHistory();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Top Navbar */}
      <Header
        sessionData={sessionData}
        onResetSession={handleResetSession}
        isResetting={isResetting}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyList.length}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col">
        {!sessionData ? (
          <div className="flex-1 flex items-center justify-center">
            <FileUpload 
              onUploadSuccess={handleUploadSuccess}
              onOpenHistory={() => setIsHistoryOpen(true)}
              historyCount={historyList.length}
            />
          </div>
        ) : (
          <div className="flex-1">
            <ChatWindow 
              key={sessionData.session_id}
              sessionData={sessionData} 
              initialMessages={initialMessages}
              onHistoryUpdated={refreshHistory}
            />
          </div>
        )}
      </main>

      {/* History Slide-over Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyList={historyList}
        onSelectSession={handleSelectHistorySession}
        onHistoryUpdated={refreshHistory}
        currentSessionId={sessionData?.session_id}
      />

    </div>
  );
}
