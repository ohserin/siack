import axios from 'axios';
import {getCookie} from "../utils/cookie.js";

// 환경별 baseURL 설정:
// Vite는 다음 우선순위로 .env 파일을 로드합니다 (모드에 따라):
//   .env, .env.local, .env.[mode], .env.[mode].local
// npm run dev (vite)  -> mode = 'development' (기본)
// npm run build       -> mode = 'production'
// 우리가 추가한 .env.development / .env.production 에서 VITE_API_BASE 값을 읽습니다.
// fallback: 개발에서는 http://localhost:8080, 프로덕션에서는 '/api'
const DEFAULT_BASE = import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:8080';
const baseURL = import.meta.env.VITE_API_BASE || DEFAULT_BASE;

if (import.meta.env.MODE !== 'production') {
    console.log('[api] baseURL =', baseURL);
}

const api = axios.create({
    baseURL,
});

// Axios 요청 인터셉터 (토큰 부착)
api.interceptors.request.use(
    config => {
        const token = getCookie('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

export default api;
