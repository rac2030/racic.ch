import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 4321,
  },
  site: 'https://racic.ch',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
  legacy: {
    collectionsBackwardsCompat: true,
  },
});
