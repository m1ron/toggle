import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
  },
  css: {
    devSourcemap: true,
  },
});
