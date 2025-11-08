import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  base: './',
  build: {
    outDir: 'build'
  },
  server: {
    host: true, // allow external connections (needed for ngrok)
    allowedHosts: true // accept requests from any domain (like ngrok)
  }
});
