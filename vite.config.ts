import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Critical for GitHub Pages to serve assets from relative paths
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Ensure large chunks (like the sqlite file if bundled) don't break the build
    chunkSizeWarningLimit: 1600
  },
  server: {
    fs: {
      // Allow serving files from the project root
      allow: ['..']
    }
  }
});