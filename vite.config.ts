import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Only split TRULY independent, non-React heavy libs
            if (id.includes('@mediapipe')) {
              return 'mediapipe';
            }
            if (id.includes('firebase')) {
              return 'firebase';
            }

            // EVERYTHING else (React, UI, Three.js) goes to vendor
            // Three.js ecosystem is too tightly bound to React to split safely
            return 'vendor';
          }
        }
      },
      external: ['node-media-server', 'fluent-ffmpeg', 'ffmpeg-static', 'electron']
    }
  },
  server: {
    host: true, // Listen on all addresses
    strictPort: true,
    port: 5173,
    proxy: {
      // Proxy API requests to Kick to bypass CORS in development
      '/api/kick': {
        target: 'https://kick.com/api/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/kick/, ''),
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
      },
      // Proxy DLive GraphQL API to bypass CORS
      '/api/dlive': {
        target: 'https://graphigo.prd.dlive.tv',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/dlive/, ''),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      }
    }
  }
});
