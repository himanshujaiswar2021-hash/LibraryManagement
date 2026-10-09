import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api/v1/notifications': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/reservations': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/v1/payments': {
        target: 'http://localhost:8084',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3000,
    host: true,
  },
});
