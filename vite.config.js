import { defineConfig } from 'vite';

export default defineConfig({
  base: '/act-values/',
  build: {
    outDir: 'dist',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
  },
});
