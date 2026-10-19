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
      // Chiave pubblica del widget Turnstile (sta nell'HTML, non è un segreto).
      // Il valore predefinito è la chiave di prova di Cloudflare, che il server
      // accetta solo su localhost (turnstile.ts)
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({
        context: 'client',
        access: 'public',
        default: '1x00000000000000000000AA',
      }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
    // Gli script dei componenti restano file esterni, mai inline nell'HTML:
    // la CSP ammette 'self' e solo l'hash dello script del tema (docs/06)
    build: { assetsInlineLimit: 0 },
  },
});
