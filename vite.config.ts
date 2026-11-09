import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  server: {
    strictPort: true,
    port: 4173,
  },
});
