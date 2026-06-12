import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

const getSessionId = () => {
  let sessionId = sessionStorage.getItem('ai_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36);
    sessionStorage.setItem('ai_session_id', sessionId);
  }
  return sessionId;
};

api.interceptors.request.use((config) => {
  config.headers['X-Session-Id'] = getSessionId();
  return config;
});

export const fetchModelInfo = async () => {
  const res = await api.get('/api/current-model');
  return res.data;
};

export const getTokens = async () => {
  const res = await api.get('/api/tokens');
  return res.data;
};

export const fetchTokenHistory = async () => {
  const res = await api.get('/api/token-history');
  return res.data;
};

export const sendMessage = async (message) => {
  const res = await api.post('/api/chat', { message });
  return res.data;
};

export const resetTokens = async () => {
  const res = await api.post('/api/reset-tokens');
  return res.data;
};
