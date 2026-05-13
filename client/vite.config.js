import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    proxy: {
      // Mirrors CRA "proxy": "http://localhost:5000"
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: 'build', // keep same output dir name as CRA for compatibility
    sourcemap: false,
  },
});
