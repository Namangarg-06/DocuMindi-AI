import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, CheckCircle2, Loader2, Cpu, Zap, Lock } from 'lucide-react';
import { uploadPDF } from '../services/api';

export default function FileUpload({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
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

    setSelectedFile(file);
    setIsProcessing(true);
    setUploadProgress(0);
    setProcessingStage('Uploading document to server...');

    try {
      // Progress simulation for user feedback during embedding computation
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
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Title & Introduction */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Chat With Your PDF
        </h2>
        <p className="mt-3 text-base text-slate-600 max-w-lg mx-auto">
          Upload any PDF document and ask questions about its content. Instant semantic retrieval powered by LangChain and local FAISS.
        </p>
      </div>

      {/* Upload Box Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-brand-500 bg-brand-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50/50'
          } ${isProcessing ? 'pointer-events-none opacity-80' : ''}`}
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
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{processingStage}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {uploadProgress < 100
                      ? `Uploading: ${uploadProgress}%`
                      : 'Running all-MiniLM-L6-v2 embeddings locally on CPU'}
                  </p>
                </div>
                {uploadProgress < 100 && (
                  <div className="w-48 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-brand-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <UploadCloud className="w-8 h-8 text-brand-600" />
                </div>
                <p className="text-base font-semibold text-slate-800">
                  Drag & drop your PDF file here
                </p>
                <p className="text-sm text-slate-500 mt-1">or click to browse from your computer</p>

                <div className="mt-5">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-colors"
                  >
                    Browse Files
                  </button>
                </div>

                <p className="mt-4 text-xs text-slate-400">
                  Standard PDF documents up to 25MB supported
                </p>
              </>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Document Processing Error</p>
              <p className="text-xs text-red-700 mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Feature Badges */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <Cpu className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <span>Local Embeddings (all-MiniLM-L6-v2)</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Temporary In-Memory Vector Store</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>Free Groq LLM Generation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
