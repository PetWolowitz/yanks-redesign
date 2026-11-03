// Recensioni scritte, sempre nella lingua originale (docs/03).
// Solo testi reali copiati dalla fonte, con il link: niente stelline, niente voti inventati.
// Fonte: la scheda Google Maps del locale, ordinata per "Nieuwste", letta il
// 2026-11-03 con il testo originale (non la traduzione di Google).
// Dal 2026-11-03 (Pietro) la home mostra le più recenti: latestReviews() le ordina
// per data e ne prende tre. Per aggiornare si aggiunge in cima la recensione nuova,
// con la stessa regola di scelta; le più vecchie escono da sole.
// Scelta (docs/03, Vincoli legali):
// - escluse quelle che nominano prodotti di cannabis, il fumare o la "qualità"
//   dei prodotti: citarle sul sito sarebbe promozione (un test lo controlla)
// - solo olandese, inglese e tedesco, le lingue del sito
// - escluse le domande, le risposte del locale, i testi tagliati da Google e
//   quelle che parlano di Zandvoort e non del locale
// - niente nomi degli autori: non servono e sono dati personali
// - testi com'erano, refusi compresi
// Date: Google mostra date relative ("3 weken geleden"); qui la data ricavata dal
// giorno della lettura, quindi vale il mese, non il giorno. Il sito mostra mese e anno
import type { Lang } from '../i18n/locales';
import { venue } from './venue';

export interface Review {
  source: 'google' | 'tripadvisor';
  // lingua originale della recensione
  lang: Lang;
  text: string;
  // data della recensione, AAAA-MM-GG (vale il mese, vedi sopra)
  date: string;
  // link alla scheda o alla recensione
  url: string;
  // true se è un estratto: il testo contiene […]
  excerpt?: boolean;
  // traduzioni mostrate su richiesta, solo dopo una rilettura
  translations?: Partial<Record<Lang, string>>;
}

export const reviews: Review[] = [
  {
    source: 'google',
    lang: 'de',
    // "3 weken geleden" il 2026-11-03
    date: '2026-10-13',
    text: 'Das Beste was Holland zu bieten hat! Ein absoluter Traum das Yanks!',
    url: venue.maps.url,
  },
  {
    source: 'google',
    lang: 'de',
    // "4 weken geleden" il 2026-11-03
    date: '2026-10-06',
    text: 'Absolut schön und gemütlich zum einkehren. Da fühlt man sich wohl wie im Wohnzimmer. Wenn es kalt ist fahren die Wände und Decken zu im Biergarten und die Wärmelampen gehen an. Herrlich mollig.',
    url: venue.maps.url,
  },
  {
    source: 'google',
    lang: 'en',
    // "een maand geleden" il 2026-11-03
    date: '2026-10-03',
    text: 'Very cool decor. Wonderful outside seating. Inside and outside are very spacious. Staff is very kind and helpful.',
    url: venue.maps.url,
  },
  {
    source: 'google',
    lang: 'de',
    // "2 maanden geleden" il 2026-11-03
    date: '2026-09-03',
    text: 'Sehr freundliches und hilfsbereites Personal und eine coole Atmosphäre',
    url: venue.maps.url,
  },
];

// Le più recenti per prime; la home ne mostra tre
export function latestReviews(list: Review[], count = 3): Review[] {
  return [...list].sort((a, b) => b.date.localeCompare(a.date)).slice(0, count);
}

// La più lunga in testa (va nella tessera grande della home), le altre nell'ordine dato
export function longestFirst(list: Review[]): Review[] {
  const longest = list.reduce<Review | undefined>((best, review) => (!best || review.text.length > best.text.length ? review : best), undefined);
  return longest ? [longest, ...list.filter((review) => review !== longest)] : [];
}
