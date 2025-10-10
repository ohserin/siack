import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        }
    },
    server: {
        host: '0.0.0.0',
        port: 3333,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8080', // 스프링 부트 백엔드 주소
                changeOrigin: true, // 호스트 헤더를 target으로 변경
                secure: false // HTTPS가 아닌 경우 필요
            }
        }
    },
    build: {
        chunkSizeWarningLimit: 1500,
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ['react', 'react-dom'],
                }
            }
        }
    }
})
