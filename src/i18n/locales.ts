// Unica fonte delle lingue del sito: la usano astro.config.mjs, le pagine e t().
// Per aggiungere una lingua (Fase 7): una voce qui e un file JSON accanto.
export const locales = ['nl', 'en', 'de'] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = 'en';
