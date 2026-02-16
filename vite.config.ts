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
        /*
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'zustand'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-popover', 'lucide-react'],
          utils: ['date-fns', 'uuid']
        }
        */
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
