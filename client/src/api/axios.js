// client/src/api/axios.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://your-app-name.onrender.com/api',  // ← Put your Render URL here
});

// Auto-attach JWT token
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;