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
  ArrowRight
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

    // Check extension
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please select a valid PDF file (.pdf extension required).');
      return;
    }

    // Check size (25MB limit)
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
        setProcessingStage('Extracting text and chunking pages...');
      }, 1200);

      const embeddingTimer = setTimeout(() => {
        setProcessingStage('Generating local Hugging Face embeddings & FAISS index...');
      }, 2500);

      const data = await uploadPDF(file, (progress) => {
        setUploadProgress(progress);
        if (progress === 100) {
          setProcessingStage('Processing text chunks & computing embeddings...');
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
    <div className="relative w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 overflow-hidden">
      
      {/* Glowing Ambient Background Blobs */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-brand-400/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-1/3 -right-32 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Hero Header */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold mb-4 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>Local Retrieval-Augmented Generation (RAG)</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Chat With Your <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">PDF Documents</span>
        </h2>

        <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Upload research papers, lecture notes, contracts, or books. Extract facts, summarize topics, and chat intelligently with grounded source citations.
        </p>

        {historyCount > 0 && (
          <div className="mt-4">
            <button
              onClick={onOpenHistory}
              className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-700 hover:text-brand-600 bg-white/80 hover:bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-2xs transition-all"
            >
              <History className="w-3.5 h-3.5 text-brand-500" />
              <span>You have {historyCount} past document session(s) in history</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        )}
      </div>

      {/* Upload Box Card */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-10 transition-all hover:shadow-2xl">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-brand-500 bg-brand-50/60 scale-[1.01]'
              : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50/60'
          } ${isProcessing ? 'pointer-events-none opacity-85' : ''}`}
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
                <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shadow-inner">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{processingStage}</p>
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    {uploadProgress < 100
                      ? `Uploading: ${uploadProgress}%`
                      : 'Computing local embeddings with all-MiniLM-L6-v2 on CPU'}
                  </p>
                </div>
                {uploadProgress < 100 && (
                  <div className="w-56 bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                    <div
                      className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-brand-500/25 transition-transform hover:scale-105">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <p className="text-lg font-bold text-slate-800">
                  Drag & drop your PDF file here
                </p>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">or click to browse from your computer</p>

                <div className="mt-5">
                  <button
                    type="button"
                    className="inline-flex items-center px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/20 transition-all hover:scale-[1.02]"
                  >
                    Browse Files
                  </button>
                </div>

                <p className="mt-4 text-[11px] text-slate-400">
                  Standard PDF files up to 25MB supported • No account required
                </p>
              </>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-red-800 text-xs sm:text-sm animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Upload Error</p>
              <p className="text-red-700 mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Highlight Feature Badges */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center space-x-2.5 text-xs text-slate-700 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
            <Cpu className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <div>
              <p className="font-semibold">Local Embeddings</p>
              <p className="text-[10px] text-slate-500">all-MiniLM-L6-v2 on CPU</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 text-xs text-slate-700 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
            <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-semibold">In-Memory FAISS</p>
              <p className="text-[10px] text-slate-500">Zero database persistence</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 text-xs text-slate-700 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
            <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <div>
              <p className="font-semibold">Fast Groq LLM</p>
              <p className="text-[10px] text-slate-500">Grounded conversational answers</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
