import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  base: './', // 👈 required for GitHub Pages
  build: {
    outDir: 'build'
  },
  server: {
    host: true,
    allowedHosts: true
  }
});
