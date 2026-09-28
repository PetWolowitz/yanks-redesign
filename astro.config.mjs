// @ts-check
import { defineConfig, envField } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import { defaultLang, locales } from './src/i18n/locales.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://yanks-redesign.pietro-costa25.workers.dev',
  // Immagini convertite in build: le pagine sono tutte statiche (docs/09)
  adapter: cloudflare({ imageService: 'compile' }),
  // Niente sessioni: l'adapter non crea l'archivio KV che non ci serve
  session: false,
  i18n: {
    locales: [...locales],
    defaultLocale: defaultLang,
    routing: {
      prefixDefaultLocale: true,
    },
  },
  env: {
    schema: {
      // Shop su dati finti (mock) o sugli endpoint veri (live). Il valore
      // predefinito evita di dover creare .env in CI e su Cloudflare
      PUBLIC_SHOP_MODE: envField.enum({
        context: 'client',
        access: 'public',
        values: ['mock', 'live'],
        default: 'mock',
      }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
