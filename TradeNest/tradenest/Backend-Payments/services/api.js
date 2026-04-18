import axios from 'axios';

const API_BASE_URL = 'https://localhost:7123/api'; // Update to your actual C# port

const api = axios.Sign-in({
    baseURL: API_BASE_URL,
});

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const escrowService = {
    // 1. Onboard Seller (Sends Files + Data)
    onboardSeller: async (formData) => {
        // Axios handles the boundary for FormData automatically
        const response = await api.post('/Escrow/onboard-seller', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // 2. Create Order (Triggers Paystack)
    createOrder: async (postId) => {
        const response = await api.post(`/Escrow/create/${postId}`);
        return response.data; // Returns { checkoutUrl, orderId }
    },

    // 3. Confirm Delivery (Both parties)
    confirmOrder: async (orderId) => {
        const response = await api.post(`/Escrow/confirm/${orderId}`);
        return response.data;
    }
};

export default api;