// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
    plugins: [
        react(),
        visualizer({
            filename: 'stats.html',   // 빌드 후 리포트 파일
            template: 'treemap',      // treemap | sunburst | network
            gzipSize: true,
            brotliSize: true,
            open: true                // 빌드 완료 시 자동으로 열기
        })
    ],
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
                changeOrigin: true,              // 호스트 헤더를 target으로 변경
                secure: false                    // HTTPS가 아닌 경우 필요
            }
        }
    },
    build: {
        // 경고 임계값(현재 번들 상황을 고려해 유지)
        chunkSizeWarningLimit: 1500,
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ['react', 'react-dom'],
                }
            }
        },
        sourcemap: false,   // 배포본은 일반적으로 off (전송량/노출 줄이기)
        minify: 'esbuild',  // 기본값(빠른 빌드)
        target: 'es2018'    // 너무 낮추면 폴리필 증가 → 유지
    }
})
