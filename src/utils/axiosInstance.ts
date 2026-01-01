import axios from 'axios';
import { getSession } from 'next-auth/react';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
    async (config) => {
        try {
            // Only fetch session if no Authorization header is already set
            if (!config.headers.Authorization) {
                const session = await getSession();
                if (session?.user?.accessToken) {
                    config.headers.Authorization = `Bearer ${session.user.accessToken}`;
                }
            }
        } catch (error) {
            console.error('Error getting session in axios interceptor:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Unauthorized request:', error.config.url);
            // Optionally redirect to login
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;