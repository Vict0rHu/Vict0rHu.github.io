// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Deployed to the user page https://vict0rhu.github.io  → base path is '/'.
// If you ever move this to a project repo, set `base: '/<repo-name>/'`.
export default defineConfig({
  site: 'https://vict0rhu.github.io',
  base: '/',
  integrations: [sitemap()],
});
