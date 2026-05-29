import axios from 'axios';

const BASE_URL = 'https://universeplatform.runasp.net';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    // headers: {
    //     'Content-Type': 'application/json',
    // },
    timeout: 10000,
    withCredentials: true,
});

// ─── Request interceptor ───────────────────────────────────────────────────────
// Remove Content-Type on GET requests (some endpoints reject it)
axiosInstance.interceptors.request.use((config) => {
    const method = config.method?.toLowerCase();
    if (method === 'get' && config.headers) {
        delete (config.headers as any)['Content-Type'];
        delete (config.headers as any)['content-type'];
    }
    return config;
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const redirectToLogin = () => {
    if (typeof window === 'undefined') return;
    // Clear all auth state so AuthContext hydrates as null on next load
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/auth/login';
};

/**
 * After a successful token refresh the API returns the user profile.
 * We update AuthContext's persisted user so the new session is seamless.
 */
const syncUserAfterRefresh = (data: {
    id?: string;
    name?: string;
    email?: string | null;
    roles?: string[];
    imageUrl?: string | null;
}) => {
    try {
        const raw = localStorage.getItem('authUser');
        if (!raw) return;
        const stored = JSON.parse(raw);
        const updated = {
            ...stored,
            id:               data.id               ?? stored.id,
            name:             data.name             ?? stored.name,
            email:            data.email            ?? stored.email,
            roles:            data.roles            ?? stored.roles,
            profilePictureUrl: data.imageUrl        ?? stored.profilePictureUrl,
        };
        localStorage.setItem('authUser', JSON.stringify(updated));
        // keep legacy compat keys
        if (updated.roles)        localStorage.setItem('roles',      JSON.stringify(updated.roles));
        if (updated.activeModule) localStorage.setItem('activeRole', updated.activeModule);
    } catch { /* non-critical */ }
};

// ─── Response interceptor (401 → refresh → retry) ─────────────────────────────

let isRefreshing = false;
let failedQueue: { resolve: (v: any) => void; reject: (e: any) => void }[] = [];

const processQueue = (error: any) => {
    failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(undefined)));
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only handle 401 errors that haven't been retried yet
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // ── Case 1: The refresh call itself returned 401 ──────────────────────
        // The refresh token is expired — log the user out immediately.
        if (originalRequest.url?.includes('/Auth/update-refresh-token')) {
            isRefreshing = false;
            processQueue(error);
            redirectToLogin();
            return Promise.reject(error);
        }

        // ── Case 2: A regular API returned 401 and another refresh is in progress
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => axiosInstance(originalRequest))
              .catch((err) => Promise.reject(err));
        }

        // ── Case 3: First 401 — attempt a token refresh ───────────────────────
        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const refreshResponse = await axiosInstance.post('/Auth/update-refresh-token');

            // Sync user profile data returned from the refresh endpoint
            if (refreshResponse.data) {
                syncUserAfterRefresh(refreshResponse.data);
            }

            processQueue(null);
            isRefreshing = false;

            // Retry the original request
            return axiosInstance(originalRequest);

        } catch (refreshError) {
            processQueue(refreshError);
            isRefreshing = false;

            // Refresh failed → force logout
            redirectToLogin();

            return Promise.reject(refreshError);
        }
    }
);

export default axiosInstance;
