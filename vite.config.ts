import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          '@shared': path.resolve(__dirname, './src/shared'),
          '@app': path.resolve(__dirname, './src/app'),
          '@widgets': path.resolve(__dirname, './src/widgets'),
          '@pages': path.resolve(__dirname, './src/pages'),
          '@entities': path.resolve(__dirname, './src/entities'),
          '@features': path.resolve(__dirname, './src/features'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                return 'vendor';
              }
            }
          }
        },
        chunkSizeWarningLimit: 1000,
      }
    };
});
