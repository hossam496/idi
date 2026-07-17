import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attaches JWT token when available
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

// Response interceptor — handles 401 / token expiry globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('idi_token');
      localStorage.removeItem('idi_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ──────────────────────────────────────────────
// Future Backend Integration Points
// ──────────────────────────────────────────────

export const authAPI = {
  login:         (credentials) => api.post('/auth/login', credentials),
  register:      (userData)    => api.post('/auth/register', userData),
  me:            ()            => api.get('/auth/me'),
  updateProfile: (data)        => api.put('/auth/profile', data),
  logout:        ()            => api.post('/auth/logout'),
};



export const grammarAPI = {
  getAll:         ()        => api.get(`/grammar`),
  getById:        (id)      => api.get(`/grammar/${id}`),
  create:         (data)    => api.post(`/grammar`, data),
  update:         (id, data)=> api.put(`/grammar/${id}`, data),
  remove:         (id)      => api.delete(`/grammar/${id}`),
  removeAll:      ()        => api.delete(`/grammar`),
  toggleFavorite: (id)      => api.put(`/grammar/${id}/favorite`),
};

export const vocabularyAPI = {
  getAll:         ()        => api.get(`/vocabulary`),
  getById:        (id)      => api.get(`/vocabulary/${id}`),
  create:         (data)    => api.post(`/vocabulary`, data),
  update:         (id, data)=> api.put(`/vocabulary/${id}`, data),
  remove:         (id)      => api.delete(`/vocabulary/${id}`),
  toggleFavorite: (id)      => api.put(`/vocabulary/${id}/favorite`),
};

export const chatAPI = {
  getConversations:  ()                   => api.get('/chat/conversations'),
  createConversation:(data = {})          => api.post('/chat/conversations', data),
  getMessages:       (conversationId)     => api.get(`/chat/conversations/${conversationId}/messages`),
  updateConversation:(id, data)           => api.put(`/chat/conversations/${id}`, data),
  deleteConversation:(id)                 => api.delete(`/chat/conversations/${id}`),
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
  getSummary: () => api.get('/stats/summary'),
  getAchievements: () => api.get('/stats/achievements'),
};

export default api;
