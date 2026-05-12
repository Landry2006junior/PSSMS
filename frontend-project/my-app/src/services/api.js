import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Authentication logic removed as per user request

export default api;

