import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import relay from 'vite-plugin-relay';

export default defineConfig({
  plugins: [react(), relay],
  server: {
    port: 3000,
    proxy: {
      '/graphql': 'http://localhost:4000',
      '/images':  'http://localhost:4000',
      '/upload':  'http://localhost:4000',
    },
  },
});
