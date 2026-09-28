// Recensioni scritte, sempre nella lingua originale (docs/03).
// Solo testi reali copiati dalla fonte, con il link: niente stelline, niente voti inventati.
import type { Lang } from '../i18n/locales';

export interface Review {
  source: 'google' | 'tripadvisor';
  // lingua originale: le recensioni Google del sito attuale sono in olandese
  lang: Lang;
  text: string;
  // link al profilo o alla recensione
  url: string;
  // traduzioni mostrate su richiesta, solo dopo una rilettura
  translations?: Partial<Record<Lang, string>>;
}

// DA RECUPERARE: le cinque recensioni Google in olandese del sito originale.
// Finché non ci sono i testi veri, la lista resta vuota.
export const reviews: Review[] = [];
