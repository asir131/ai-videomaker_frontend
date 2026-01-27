import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Dynamic backend port detection
const getBackendPort = () => {
  try {
    // Check if backend port file exists (written by backend server)
    const backendPortPath = path.join(process.cwd(), '..', 'ai_video_backend', '.backend-port')
    if (fs.existsSync(backendPortPath)) {
      const port = parseInt(fs.readFileSync(backendPortPath, 'utf8').trim())
      console.log(`🔗 Backend port detected from file: ${port}`)
      return port
    }
  } catch (error) {
    console.warn('⚠️ Could not read backend port file:', error.message)
  }

  // Fallback to default port
  const defaultPort = 3001
  console.log(`🔗 Using default backend port: ${defaultPort}`)
  return defaultPort
}

const BACKEND_PORT = getBackendPort()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "https://gossip-rainbow-learn-treat.trycloudflare.com",
    ],
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
