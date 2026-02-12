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


export default axiosInstance;