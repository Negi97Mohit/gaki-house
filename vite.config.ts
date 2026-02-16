import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
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
            // 1. Heavy, independent libs (Leaf nodes in dependency graph)
            if (id.includes('three') || id.includes('@react-three') || id.includes('@mkkellogg')) {
              return 'three';
            }
            if (id.includes('@mediapipe')) {
              return 'mediapipe';
            }
            if (id.includes('firebase')) {
              return 'firebase';
            }

            // 2. UI Libraries (often interdependent, group them safely)
            if (id.includes('@radix-ui') || id.includes('lucide-react') || id.includes('framer-motion')) {
              return 'ui';
            }

            // 3. Everything else goes to vendor (React, Router, Zustand, Utils)
            // This avoids the 'vendor' <-> 'vendor-react' cycle by keeping them together
            return 'vendor';
          }
        }
      },
      external: ['node-media-server', 'fluent-ffmpeg', 'ffmpeg-static', 'electron']
    }
  },
  server: {
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
      }
    }
  }
});
