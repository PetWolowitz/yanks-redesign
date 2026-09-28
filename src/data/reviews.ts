// Recensioni scritte, sempre nella lingua originale (docs/03).
// Solo testi reali copiati dalla fonte, con il link: niente stelline, niente voti inventati.
// Fonte: le recensioni Google riportate su yanks.nl (lette il 2026-09-28).
// Scelte (docs/03, Vincoli legali):
// - escluse le due che nominano prodotti di cannabis ("weed hash", "wiet, hasj",
//   "edibles"): citarle sul sito sarebbe promozione
// - esclusa quella che è una domanda ("scootmobiel"), non una recensione
// - della recensione lunga solo l'estratto su terrazza e personale, con […];
//   tolto l'asterisco di una nota a piè di pagina non riportata
// - niente nomi degli autori: non servono e sono dati personali
// - testi com'erano, refusi compresi
import type { Lang } from '../i18n/locales';
import { venue } from './venue';

export interface Review {
  source: 'google' | 'tripadvisor';
  // lingua originale: le recensioni Google del sito attuale sono in olandese
  lang: Lang;
  text: string;
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
    lang: 'nl',
    text: 'Kon het niet niet doen na zo een bezoekje!!! nadat je om half 2 belt of het uitkomt. Kan je tot kwart voor 3 nog halen. Binnen aangekomen vriendelijk geholpen net (27-11-23 02:36) en zelfs een shirt gekregen. Veel mensen klagen over de prijzen maar die waren gelukkig op een heel groot bord aangegeven, super handig. Alles bij elkaar helemaal prima de schrik van iedere azijn zeiker maar voor de gewone mens top!',
    url: venue.maps.url,
  },
  {
    source: 'google',
    lang: 'nl',
    text: 'Lekker koud drinken of een bakje (speciale) koffie of thee, je kunt er goed toeven op t grote (overdekte) buitenterras met mooie grote houten tafels en banken, indianachtig ingerichte stijl en een aantal gametafels. […] Leuke vriendelijke medewerkers die samen ook goed en gezellig contact hebben. Goed deurbeleid.',
    url: venue.maps.url,
    excerpt: true,
  },
  {
    source: 'google',
    lang: 'nl',
    text: 'Zeer gezellige coffeeshop met goede prijs/kwaliteit verhouding. Vriendelijk personeel.',
    url: venue.maps.url,
  },
];
