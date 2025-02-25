import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    eslint(),
  ],
  optimizeDeps: {
    exclude: ['@mui/material', '@mui/icons-material'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: './setupTests.js',
    coverage: {
      exclude: [
        'dist/',
        'src/data/*',
        'src/main.jsx',
        'eslint.config.js',
        'vite.config.js',
      ],
    },
  },
});
