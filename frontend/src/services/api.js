/**
 * API Service for DocuMindi-AI RAG Application.
 * Communicates with FastAPI backend endpoints.
 */

import axios from 'axios';

// Base URL: Vite proxy handles /api -> http://127.0.0.1:8000
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
  timeout: 120000, // 2 minutes timeout for embedding generation on larger PDFs
});

/**
 * Upload a PDF file to the backend
 * @param {File} file
 * @param {Function} [onUploadProgress]
 * @returns {Promise<Object>} Upload response with session_id, total_pages, total_chunks
 */
export async function uploadPDF(file, onUploadProgress) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      },
    });
    return response.data;
  } catch (error) {
    throw extractErrorMessage(error);
  }
}

/**
 * Send a chat question to the RAG pipeline
 * @param {string} sessionId
 * @param {string} question
 * @returns {Promise<{ answer: string, sources: Array }>}
 */
export async function sendChatMessage(sessionId, question) {
  try {
    const response = await apiClient.post('/api/chat', {
      session_id: sessionId,
      question: question.trim(),
    });
    return response.data;
  } catch (error) {
    throw extractErrorMessage(error);
  }
}

/**
 * Delete a session and its in-memory vector store
 * @param {string} sessionId
 * @returns {Promise<Object>}
 */
export async function deleteSession(sessionId) {
  try {
    const response = await apiClient.delete(`/api/session/${sessionId}`);
    return response.data;
  } catch (error) {
    // Non-fatal if session already expired
    console.warn('Session deletion returned warning:', error);
    return null;
  }
}

/**
 * Check backend health status
 * @returns {Promise<Object>}
 */
export async function checkHealth() {
  try {
    const response = await apiClient.get('/api/health');
    return response.data;
  } catch (error) {
    throw extractErrorMessage(error);
  }
}

/**
 * Helper to produce clean, user-friendly error messages
 */
function extractErrorMessage(error) {
  if (error.response) {
    // Backend returned 4xx or 5xx response
    const detail = error.response.data?.detail;
    if (typeof detail === 'string') {
      return new Error(detail);
    } else if (Array.isArray(detail)) {
      return new Error(detail.map(d => d.msg || JSON.stringify(d)).join(', '));
    }
    return new Error(error.response.statusText || 'Server error occurred');
  } else if (error.request) {
    // No response received from server
    return new Error('Cannot connect to backend server. Please verify the FastAPI backend is running on http://127.0.0.1:8000');
  }
  return new Error(error.message || 'An unknown network error occurred');
}
