import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import relay from 'vite-plugin-relay';

export default defineConfig({
  plugins: [react(), relay],
  server: {
    port: 47320,
    proxy: {
      '/graphql': 'http://localhost:47321',
      '/images':  'http://localhost:47321',
      '/upload':  'http://localhost:47321',
    },
  },
});
