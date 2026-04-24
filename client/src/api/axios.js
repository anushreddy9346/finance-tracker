// client/src/api/axios.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://finance-tracker-pe5z.onrender.com/api',  // Production backend URL
});

// Auto-attach JWT token
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;