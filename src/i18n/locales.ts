// Unica fonte delle lingue del sito: la usano astro.config.mjs, le pagine e t().
// Per aggiungere una lingua (Fase 7): una voce qui e un file JSON accanto.
export const locales = ['nl', 'en', 'de'] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = 'en';

// Prima lingua del browser che il sito ha ("nl-BE" vale "nl"), altrimenti l'inglese.
// La usa la pagina "/" per scegliere dove mandare il visitatore
export function pickLang(browserLanguages: readonly string[]): Lang {
  for (const tag of browserLanguages) {
    const base = tag.toLowerCase().split('-')[0];
    const match = locales.find((l) => l === base);
    if (match) return match;
  }
  return defaultLang;
}

// Nome di ogni lingua nella lingua stessa, per il selettore: uguale in ogni pagina
export const languageNames: Record<Lang, string> = {
  nl: 'Nederlands',
  en: 'English',
  de: 'Deutsch',
};
