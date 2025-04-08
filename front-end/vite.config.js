import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxies /api → Express (default API port 3001; 3000 is often taken by other tools).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
})
