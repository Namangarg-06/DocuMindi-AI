import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  AlertCircle, 
  Loader2, 
  Cpu, 
  Zap, 
  Lock, 
  Sparkles, 
  History,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  SearchCheck
} from 'lucide-react';
import { uploadPDF } from '../services/api';

export default function FileUpload({ onUploadSuccess, onOpenHistory, historyCount = 0 }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const validateAndProcessFile = async (file) => {
    setErrorMessage('');

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please select a valid PDF file (.pdf extension required).');
      return;
    }

    const maxSizeBytes = 25 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMessage('File size exceeds the 25MB limit. Please choose a smaller PDF.');
      return;
    }

    if (file.size === 0) {
      setErrorMessage('The selected file is empty (0 bytes).');
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);
    setProcessingStage('Uploading document to server...');

    try {
      const progressTimer = setTimeout(() => {
        setProcessingStage('Extracting text and chunking pages with PyPDFLoader...');
      }, 1000);

      const embeddingTimer = setTimeout(() => {
        setProcessingStage('Generating local Hugging Face embeddings & indexing in FAISS...');
      }, 2200);

      const data = await uploadPDF(file, (progress) => {
        setUploadProgress(progress);
        if (progress === 100) {
          setProcessingStage('Finalizing vector embeddings on CPU...');
        }
      });

      clearTimeout(progressTimer);
      clearTimeout(embeddingTimer);

      setProcessingStage('Done!');
      onUploadSuccess(data);
    } catch (err) {
      console.error('Upload failed:', err);
      setErrorMessage(err.message || 'Failed to upload and process the PDF document.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 z-10">
      
      {/* Hero Presentation Header */}
      <div className="text-center mb-10">
        
        {/* Animated Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-5 shadow-lg shadow-indigo-500/10 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Local Retrieval-Augmented Generation</span>
        </div>

        {/* Hero Headline */}
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Chat With Any <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">PDF Document</span>
        </h2>

        {/* Subtitle */}
        <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Upload research reports, textbooks, or notes. Ask complex questions and get grounded answers with verifiable source page citations—all powered locally.
        </p>

        {/* Quick History Pill */}
        {historyCount > 0 && (
          <div className="mt-4">
            <button
              onClick={onOpenHistory}
              className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 px-4 py-1.5 rounded-full shadow-md transition-all hover:border-indigo-500/40"
            >
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span>You have <strong className="text-white">{historyCount}</strong> past session(s) in history</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        )}
      </div>

      {/* Upload Container with Radiant Border Gradient */}
      <div className="relative p-[1px] rounded-3xl bg-gradient-to-r from-blue-500/40 via-indigo-500/40 to-purple-500/40 shadow-2xl shadow-indigo-950/60 transition-all">
        <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-10">
          
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
                : 'border-slate-700 hover:border-indigo-500/60 hover:bg-slate-800/40'
            } ${isProcessing ? 'pointer-events-none opacity-90' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center">
              {isProcessing ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/20">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">{processingStage}</p>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      {uploadProgress < 100
                        ? `Upload progress: ${uploadProgress}%`
                        : 'Running sentence-transformers (all-MiniLM-L6-v2) on CPU'}
                    </p>
                  </div>
                  {uploadProgress < 100 && (
                    <div className="w-64 bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner border border-white/5">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="w-18 h-18 p-4 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center mb-5 shadow-xl shadow-indigo-500/30 transition-transform duration-300 hover:scale-105">
                    <UploadCloud className="w-9 h-9" />
                  </div>
                  
                  <p className="text-lg font-bold text-white">
                    Drag & drop your PDF file here
                  </p>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
                    or click anywhere in the box to browse from your computer
                  </p>

                  <div className="mt-6">
                    <button
                      type="button"
                      className="inline-flex items-center space-x-2 px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02]"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Browse PDF Files</span>
                    </button>
                  </div>

                  <p className="mt-5 text-[11px] text-slate-500">
                    PDF files up to 25MB supported • Instant in-memory vector indexing
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mt-5 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start space-x-3 text-rose-300 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-rose-200">Processing Error</p>
                <p className="text-rose-300/90 mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Highlight Feature Badges Grid */}
          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <div className="flex items-center space-x-3 text-xs text-slate-300 bg-slate-800/40 p-3 rounded-2xl border border-white/5">
              <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center flex-shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">Local Embeddings</p>
                <p className="text-[10px] text-slate-400">all-MiniLM-L6-v2 on CPU</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs text-slate-300 bg-slate-800/40 p-3 rounded-2xl border border-white/5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0">
                <SearchCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">In-Memory FAISS</p>
                <p className="text-[10px] text-slate-400">Zero cloud database storage</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs text-slate-300 bg-slate-800/40 p-3 rounded-2xl border border-white/5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">Fast Groq LLM</p>
                <p className="text-[10px] text-slate-400">Accurate conversational answers</p>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
