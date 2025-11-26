import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy for all API routes starting with /api
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // remove the /api prefix if your backend endpoints don't include it
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})