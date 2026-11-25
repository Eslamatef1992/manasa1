import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'client',
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: { manualChunks: (id) => (/node_modules\/(three|@react-three)/.test(id) ? 'three' : undefined) },
    },
  },
  server: { proxy: { '/api': 'http://127.0.0.1:4100', '/uploads': 'http://127.0.0.1:4100' } },
});
