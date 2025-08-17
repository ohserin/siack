import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    // 빌드 시 아래를 적용해서 빌드
    // baseURL: '/api',
});

export default api;