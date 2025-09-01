import axios from 'axios';
import {getCookie} from "../utils/cookie.js";

const api = axios.create({
    baseURL: 'http://localhost:8080',
    // 빌드 시 아래를 적용해서 빌드
    // baseURL: '/api',
});

// Axios 요청 인터셉터
api.interceptors.request.use(
    config => {
        const token = getCookie('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default api;
