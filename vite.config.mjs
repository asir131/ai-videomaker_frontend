import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Backend configuration - update this if your backend runs on a different port
const BACKEND_PORT = 3001
console.log(`🔗 Vite proxy configured for backend on port ${BACKEND_PORT}`)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: `http://localhost:${BACKEND_PORT}`,
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying request:', req.method, req.url, '->', proxyReq.path);
          });
        },
      },
    },
  },
  build: {
    outDir: 'dist',
  },
})
