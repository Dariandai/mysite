// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://dar1an.dpdns.org',
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
