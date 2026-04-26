// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  adapter: cloudflare(),
  site: 'https://dar1an.pages.dev',
  image: {
    domains: ['img.dar1an.dpdns.org', 'images.unsplash.com'],
    remotePatterns: [{ protocol: 'https' }],
  },
  vite: {
    build: {
      cssCodeSplit: true,
    },
  },
  compressHTML: true,
});
