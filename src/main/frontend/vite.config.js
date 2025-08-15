import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 모든 네트워크 인터페이스에서 접근 허용
    port: 3333,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080', // 스프링 부트 백엔드 주소
        changeOrigin: true, // 호스트 헤더를 target으로 변경
        secure: false // HTTPS가 아닌 경우 필요
      }
    }
  }
});