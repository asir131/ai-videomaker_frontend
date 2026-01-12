import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read backend port from .backend-port file, fallback to 3000
function getBackendPort() {
  try {
    const portFile = join(__dirname, '../backend/.backend-port')
    const port = readFileSync(portFile, 'utf8').trim()
    return port || '3000'
  } catch (error) {
    console.log('⚠️  .backend-port not found, using default port 3000')
    return '3000'
  }
}

const backendPort = getBackendPort()
console.log(`🔗 Vite proxy configured for backend on port ${backendPort}`)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: `http://localhost:${backendPort}`,
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
