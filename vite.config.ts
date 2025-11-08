import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  base: '/phaze-fresh/', // 👈 your GitHub repo name here!
  build: {
    outDir: 'build'
  },
  server: {
    host: true,
    allowedHosts: true
  }
});
