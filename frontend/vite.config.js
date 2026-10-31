import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev: proxy API + uploads to the Express backend so no CORS setup is needed
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
