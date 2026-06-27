import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy /api ke backend saat dev (uvicorn di :8080) supaya tak ada masalah CORS lokal.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
  build: { outDir: 'dist', sourcemap: false },
})
