// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// User site (username.github.io) is served from the root, so no `base` is needed.
export default defineConfig({
  site: 'https://asifur-rahman9.github.io',
  integrations: [react()],
});
