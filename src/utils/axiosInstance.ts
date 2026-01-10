import axios from 'axios';
import { getSession } from 'next-auth/react';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    async (config) => {
        try {
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

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Unauthorized request:', error.config.url);
           
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;