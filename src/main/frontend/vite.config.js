import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Vite 개발 서버 포트 명시 (기본값 5173이 아닌 3000으로 설정)
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 스프링 부트 백엔드 주소
        changeOrigin: true, // 호스트 헤더를 target으로 변경
        secure: false // HTTPS가 아닌 경우 필요
      }
    }
  }
});