/**
 * History Service:
 * Manages saved document sessions, past questions, and AI answers in browser localStorage.
 * Allows users to view past activity, inspect previous Q&A, and delete history items anytime.
 */

const HISTORY_STORAGE_KEY = 'documindi_rag_history_v1';

/**
 * Get all saved history items sorted by most recent
 * @returns {Array<Object>}
 */
export function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    console.error('Failed to load history from localStorage:', e);
    return [];
  }
}

/**
 * Save or update a session in history
 * @param {Object} sessionData - { session_id, filename, total_pages, total_chunks }
 * @param {Array<Object>} messages - Array of chat messages
 */
export function saveSessionToHistory(sessionData, messages) {
  if (!sessionData || !sessionData.session_id) return;

  try {
    const history = getHistory();
    const existingIndex = history.findIndex(item => item.session_id === sessionData.session_id);

    // Filter out welcome-only if user wants, but keeping meaningful messages is good
    const meaningfulMessages = messages.filter(m => m.id !== 'welcome');

    const historyEntry = {
      session_id: sessionData.session_id,
      filename: sessionData.filename,
      total_pages: sessionData.total_pages || 1,
      total_chunks: sessionData.total_chunks || 0,
      timestamp: existingIndex >= 0 ? history[existingIndex].timestamp : new Date().toISOString(),
      last_updated: new Date().toISOString(),
      question_count: meaningfulMessages.filter(m => m.sender === 'user').length,
      messages: messages,
    };

    if (existingIndex >= 0) {
      history[existingIndex] = historyEntry;
    } else {
      history.unshift(historyEntry); // Add to beginning
    }

    // Keep max 50 recent documents to prevent storage bloat
    const trimmed = history.slice(0, 50);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save session to history:', e);
  }
}

/**
 * Delete a specific session from history
 * @param {string} sessionId
 * @returns {Array<Object>} Updated history list
 */
export function deleteHistoryItem(sessionId) {
  try {
    const history = getHistory();
    const filtered = history.filter(item => item.session_id !== sessionId);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (e) {
    console.error('Failed to delete history item:', e);
    return getHistory();
  }
}

/**
 * Clear all saved history
 */
export function clearAllHistory() {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear history:', e);
  }
}
