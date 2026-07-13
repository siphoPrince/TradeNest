import axios from 'axios';

// Check if window exists safely to prevent build-time crashes
const isProduction = typeof window !== 'undefined' 
    ? window.location.hostname !== 'localhost' 
    : true;

// Clean, explicit base URL assignment
const API_BASE_URL = isProduction 
    ? 'https://www.cylosocials.co.za'
    : 'http://localhost:5000';
    

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});

// Automatically attach your JWT session token to every request header
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Clean, single default export of your Axios client instance
export default api;