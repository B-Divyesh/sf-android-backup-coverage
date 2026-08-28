import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const buildId = process.env.BUILD_ID ?? Date.now().toString(36);

export default defineConfig({
  define: {
    __BUILD_ID__: JSON.stringify(buildId),
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'service-worker': resolve(__dirname, 'src/service-worker.ts'),
      },
      output: {
        // The app shell can be cached forever because every emitted filename
        // changes with its content. The service worker deliberately remains
        // top-level so it keeps its stable scope.
        entryFileNames: (chunk) => chunk.name === 'service-worker' ? 'sw.js' : 'assets/app-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => assetInfo.names.some((name) => name.endsWith('.css')) ? 'assets/app-[hash][extname]' : 'assets/[name]-[hash][extname]',
      },
    },
  },
});
