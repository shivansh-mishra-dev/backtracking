import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["shivansh013.duckdns.org"],
    // Local dev: forward /api/* to the FastAPI backend (backend/start.py, port 3013)
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3013",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  }
})
