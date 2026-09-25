// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Indirizzo definitivo da inserire dopo il primo deploy (docs/00, passo 4.6)
  site: 'https://yanks-redesign.workers.dev',
  // Immagini convertite in build: le pagine sono tutte statiche (docs/09)
  adapter: cloudflare({ imageService: 'compile' }),
  // Niente sessioni: l'adapter non crea l'archivio KV che non ci serve
  session: false,
  i18n: {
    locales: ['nl', 'en', 'de'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
