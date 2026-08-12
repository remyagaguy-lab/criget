import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.criget.com',
  output: 'server',
  adapter: cloudflare(),
  integrations: [sitemap()],
  image: {
    // Sharp n'est pas compatible avec Cloudflare Workers — on utilise le service passthrough
    service: { entrypoint: 'astro/assets/services/noop' }
  }
});
