import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  image: {
    // Sharp n'est pas compatible avec Cloudflare Workers — on utilise le service passthrough
    service: { entrypoint: 'astro/assets/services/noop' }
  }
});
