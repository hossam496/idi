/**
 * Axios instance + interceptors.
 *
 * Request interceptor:
 *   - Attaches JWT Bearer token from localStorage
 *
 * Response interceptors:
 *   1. 401 — clear auth state and redirect to landing page
 *   2. 429 — read Retry-After header, attach retryAfter to the error object
 *            so callers (ChatContext, etc.) can display a countdown or message
 *   3. All other errors pass through unchanged
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60_000,          // AI responses can be slow — 60 s
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor — attach JWT ─────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('idi_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 / 429 / other ─────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status      = error.response?.status;
    const data        = error.response?.data ?? {};
    const headers     = error.response?.headers ?? {};

    // ── 401 — token expired or invalid ───────────────────────────────────────
    if (status === 401) {
      localStorage.removeItem('idi_token');
      localStorage.removeItem('idi_user');
      window.location.href = '/';
      return Promise.reject(error);
    }

    // ── 409 — duplicate (expected) — suppress console noise ──────────────────
    // The service layer handles duplicates silently; no UI error needed.
    if (status === 409) {
      return Promise.reject(error); // pass through without logging
    }

    // ── 429 — rate limit (backend limiter OR Groq) ────────────────────────────
    if (status === 429) {
      // Parse Retry-After from header (seconds) or body
      const headerVal   = headers['retry-after'];
      const retryAfter  = headerVal
        ? Math.ceil(Number(headerVal)) || 60
        : (data.retryAfter ?? 60);

      // Friendly bilingual message based on source
      const source = data.source ?? 'unknown';  // 'groq' | 'backend' | 'unknown'
      const itMsg  = source === 'groq'
        ? `⏳ Il servizio AI ha raggiunto il limite di richieste. Riprova tra ${retryAfter} secondi.`
        : `⏳ Troppe richieste. Riprova tra ${retryAfter} secondi.`;
      const arMsg  = source === 'groq'
        ? `⏳ خدمة الذكاء الاصطناعي وصلت للحد الأقصى. أعد المحاولة بعد ${retryAfter} ثانية.`
        : `⏳ طلبات كثيرة جداً. أعد المحاولة بعد ${retryAfter} ثانية.`;

      // Attach extra fields to the error so ChatContext can read them directly
      error.retryAfter      = retryAfter;
      error.friendlyIt      = itMsg;
      error.friendlyAr      = arMsg;
      error.rateLimitSource = source;

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// ── API namespaces ────────────────────────────────────────────────────────────

export const authAPI = {
  login:         (credentials) => api.post('/auth/login', credentials),
  register:      (userData)    => api.post('/auth/register', userData),
  me:            ()            => api.get('/auth/me'),
  updateProfile: (data)        => api.put('/auth/profile', data),
  logout:        ()            => api.post('/auth/logout'),
};

export const grammarAPI = {
  getAll:         ()         => api.get('/grammar'),
  getById:        (id)       => api.get(`/grammar/${id}`),
  create:         (data)     => api.post('/grammar', data),
  update:         (id, data) => api.put(`/grammar/${id}`, data),
  remove:         (id)       => api.delete(`/grammar/${id}`),
  removeAll:      ()         => api.delete('/grammar'),
  toggleFavorite: (id)       => api.put(`/grammar/${id}/favorite`),
};

export const vocabularyAPI = {
  getAll:         ()         => api.get('/vocabulary'),
  getById:        (id)       => api.get(`/vocabulary/${id}`),
  create:         (data)     => api.post('/vocabulary', data),
  update:         (id, data) => api.put(`/vocabulary/${id}`, data),
  remove:         (id)       => api.delete(`/vocabulary/${id}`),
  removeAll:      ()         => api.delete('/vocabulary'),
  toggleFavorite: (id)       => api.put(`/vocabulary/${id}/favorite`),
};

export const chatAPI = {
  getConversations:   ()           => api.get('/chat/conversations'),
  createConversation: (data = {})  => api.post('/chat/conversations', data),
  getMessages:        (id)         => api.get(`/chat/conversations/${id}/messages`),
  updateConversation: (id, data)   => api.put(`/chat/conversations/${id}`, data),
  deleteConversation: (id)         => api.delete(`/chat/conversations/${id}`),
  sendMessage: (formData, onUploadProgress) =>
    api.post('/chat', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onUploadProgress
        ? (e) => onUploadProgress(Math.round((e.loaded * 100) / (e.total || 1)))
        : undefined,
    }),
  sendVoiceMessage: (formData) =>
    api.post('/chat/voice', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const statsAPI = {
  getSummary:      () => api.get('/stats/summary'),
  getAchievements: () => api.get('/stats/achievements'),
};

export default api;
