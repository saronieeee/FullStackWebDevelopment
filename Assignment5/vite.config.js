import {defineConfig} from 'vitest/config';
import eslint from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    eslint(),
  ],
  test: {
    environment: 'node',
    coverage: {
      exclude: [
        'src/server.js',
        'eslint.config.js',
        'vite.config.js',
      ],
    },
  },
});
