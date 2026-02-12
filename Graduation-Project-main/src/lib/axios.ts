import axios from 'axios';

const BASE_URL = 'https://universeplatform.runasp.net';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (originalRequest.url?.includes('/Auth/update-refresh-token')) {
                isRefreshing = false;
                processQueue(error, null);

                if (typeof window !== 'undefined') {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = '/auth/login';
                }
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        return axiosInstance(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await axiosInstance.post('/Auth/update-refresh-token');

                processQueue(null, 'success');
                isRefreshing = false;

                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;

                if (typeof window !== 'undefined') {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = '/auth/login';
                }

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;