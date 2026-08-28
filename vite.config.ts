import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => assetInfo.names.some((name) => name.endsWith('.css')) ? 'assets/app.css' : 'assets/[name]-[hash][extname]',
      },
    },
  },
});
