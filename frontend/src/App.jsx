import React, { useState } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import ChatWindow from './components/ChatWindow';
import { deleteSession } from './services/api';

export default function App() {
  const [sessionData, setSessionData] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleUploadSuccess = (data) => {
    setSessionData({
      session_id: data.session_id,
      filename: data.filename,
      total_pages: data.total_pages,
      total_chunks: data.total_chunks,
    });
  };

  const handleResetSession = async () => {
    if (!sessionData) return;

    setIsResetting(true);
    try {
      // Call backend to destroy FAISS index and session memory
      await deleteSession(sessionData.session_id);
    } catch (e) {
      console.warn('Reset warning:', e);
    } finally {
      setSessionData(null);
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Header
        sessionData={sessionData}
        onResetSession={handleResetSession}
        isResetting={isResetting}
      />

      <main className="flex-1 flex flex-col">
        {!sessionData ? (
          <div className="flex-1 flex items-center justify-center">
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        ) : (
          <div className="flex-1">
            <ChatWindow sessionData={sessionData} />
          </div>
        )}
      </main>
    </div>
  );
}
